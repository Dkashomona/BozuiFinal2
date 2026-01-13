/* ===========================================================
   FIREBASE FUNCTIONS v2 — STRIPE + REVIEWS (FIXED VERSION)
=========================================================== */

import cors from "cors";
import Stripe from "stripe";
import * as admin from "firebase-admin";

import { defineSecret } from "firebase-functions/params";
import { onRequest, onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentWritten } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";

admin.initializeApp();
const db = admin.firestore();
const corsHandler = cors({ origin: true });

/* ===========================================================
   SECRETS
=========================================================== */
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");

/* ===========================================================
   TYPES
=========================================================== */
type CartItem = {
  id: string;
  name: string;
  qty: number;
  price: number;        // base price (from Firestore ONLY)
  size?: string;
  color?: string;

  unitPrice?: number;   // final price after campaigns
  campaignId?: string;
};

function normalizeCountry(country?: string): string {
  if (!country) return "US";

  const c = country.toUpperCase().trim();

  if (c === "USA" || c === "UNITED STATES" || c === "UNITED STATES OF AMERICA") {
    return "US";
  }

  return c;
}

/* ===========================================================
   UTIL — STRIPE CUSTOMER
=========================================================== */
async function getOrCreateCustomer(uid: string, stripe: Stripe) {
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();

  if (snap.exists && snap.data()?.stripeCustomerId) {
    return snap.data()!.stripeCustomerId;
  }

  const customer = await stripe.customers.create({ metadata: { uid } });
  await ref.set({ stripeCustomerId: customer.id }, { merge: true });

  return customer.id;
}


/* ---------------------------------------------------------
   UTIL — NOTIFY ADMINS
--------------------------------------------------------- */
async function sendAdminNotification(message: string) {
  const snap = await db.collection("admin_devices").get();
  if (snap.empty) return;

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      snap.docs.map((d) => ({
        to: d.data().expoPushToken,
        title: "Bozuishop Admin",
        body: message,
        sound: "default",
      }))
    ),
  });
}






/* ==========================================================
   1) CREATE ORDER (HTTPS)
========================================================== */

export const createOrder = onCall(
  { region: "us-central1" },
  async (req) => {
    /* ==========================================================
       AUTH
    ========================================================== */
    const uid = req.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Login required");
    }

    /* ==========================================================
       INPUT
    ========================================================== */
    const { items, address } = req.data;
    if (!Array.isArray(items) || items.length === 0) {
      throw new HttpsError("invalid-argument", "Invalid items");
    }

    const country = normalizeCountry(address?.country);

    /* ==========================================================
       SNAPSHOT PRODUCTS (IMMUTABLE ORDER ITEMS)
    ========================================================== */
    const baseItems = await Promise.all(
      items.map(async (i: any) => {
        const snap = await db.collection("products").doc(i.id).get();
        if (!snap.exists) {
          throw new HttpsError("not-found", "Product missing");
        }

        const product = snap.data()!;

        return {
          id: i.id,
          name: product.name,
          image: product.images?.[0] ?? null, // ✅ FIX: SNAPSHOT IMAGE
          qty: i.qty,
          price: product.price,
          unitPrice: product.price,
        };
      })
    );

    /* ==========================================================
       APPLY CAMPAIGNS (SERVER SOURCE OF TRUTH)
    ========================================================== */
    const campaign = await applyCampaigns(baseItems, uid);

    /* ==========================================================
       TOTALS
    ========================================================== */
    const tax = calculateTax(campaign.total, country);
    const shipping = calculateShipping(campaign.total);
    const total = Math.round((campaign.total + tax + shipping) * 100) / 100;
    const amount = Math.round(total * 100);

    const orderRef = db.collection("orders").doc();

    /* ==========================================================
       TRANSACTION
    ========================================================== */
    await db.runTransaction(async (tx) => {
      // 🔐 VERIFY STOCK
      for (const item of campaign.items) {
        const productRef = db.collection("products").doc(item.id);
        const snap = await tx.get(productRef);

        const stock = snap.data()?.stock ?? 0;
        if (stock < item.qty) {
          throw new HttpsError(
            "failed-precondition",
            `Out of stock: ${snap.data()?.name}`
          );
        }
      }

      // 🔻 DECREMENT STOCK + LOG
      for (const item of campaign.items) {
        tx.update(db.collection("products").doc(item.id), {
          stock: admin.firestore.FieldValue.increment(-item.qty),
        });

        tx.set(db.collection("inventory_logs").doc(), {
          productId: item.id,
          change: -item.qty,
          reason: "order_created",
          orderId: orderRef.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // 🧾 CREATE ORDER (SNAPSHOT)
      tx.set(orderRef, {
        orderId: orderRef.id,
        uid,
        address: { ...address, country },
        items: campaign.items,
        subtotal: campaign.subtotal,
        discount: campaign.discount,
        tax,
        shipping,
        total,
        amount,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    /* ==========================================================
       RETURN
    ========================================================== */
    return { orderId: orderRef.id };
  }
);

















/* ==========================================================
   2) PREVENT DUPLICATE REVIEWS
========================================================== */
export const preventDuplicateReviews = onDocumentCreated(
  "reviews/{reviewId}",
  async (event) => {
    const newReview = event.data?.data();
    if (!newReview) return;

    const { userId, productId } = newReview;

    const existing = await db
      .collection("reviews")
      .where("userId", "==", userId)
      .where("productId", "==", productId)
      .get();

    if (existing.size > 1) {
      console.warn("Duplicate review deleted:", userId, productId);

      await event.data?.ref.delete();

      await db.collection("review_audit_logs").add({
        type: "duplicate_blocked",
        userId,
        productId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    else {
      // 🔔 Notify admins of new review
      const productSnap = await db.collection("products").doc(productId).get();
      const productName = productSnap.data()?.name || productId;
      await sendAdminNotification(`New review submitted for ${productName} (${newReview.rating}⭐)`);
    }
  }
);

/* ==========================================================
   3) PAYMENT SHEET
========================================================== */
export const createPaymentSheet = onCall(
  {
    region: "us-central1",
    secrets: [STRIPE_SECRET_KEY],
  },
  async (req) => {
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());


    const uid = req.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Login required");

    const orderId = req.data.orderId;
    if (!orderId)
      throw new HttpsError("invalid-argument", "Missing orderId");

    const snap = await db.collection("orders").doc(orderId).get();
    if (!snap.exists)
      throw new HttpsError("not-found", "Order not found");

    const order = snap.data()!;

    // ✔ MUST pass stripe because your function expects 2 args
    const customerId = await getOrCreateCustomer(uid, stripe);

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: "2024-06-20" }
    );

    const pi = await stripe.paymentIntents.create({
      amount: order.amount,
      currency: "usd",
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: { orderId, uid },
    });

    await snap.ref.update({ paymentIntentId: pi.id });

    return {
      paymentIntent: pi.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customerId,
    };
  }
);




/* ===========================================================
   4) WEB STRIPE CHECKOUT (MATCHES CART TOTAL)
=========================================================== */
export const createCheckoutSession = onCall(
  {
    region: "us-central1",
    secrets: [STRIPE_SECRET_KEY],
  },
  async (req) => {
    /* ==========================================================
       AUTH
    ========================================================== */
    const uid = req.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Login required");
    }

    /* ==========================================================
       INPUT VALIDATION
    ========================================================== */
    const { orderId } = req.data;
    if (!orderId || typeof orderId !== "string") {
      throw new HttpsError("invalid-argument", "Missing or invalid orderId");
    }

    /* ==========================================================
       FETCH ORDER
    ========================================================== */
    const snap = await db.collection("orders").doc(orderId).get();
    if (!snap.exists) {
      throw new HttpsError("not-found", "Order not found");
    }

    const order = snap.data()!;

    /* ==========================================================
       OWNERSHIP CHECK
    ========================================================== */
    if (!order.uid) {
      throw new HttpsError(
        "failed-precondition",
        "Order is missing owner UID. Please recreate the order."
      );
    }

    if (order.uid !== uid) {
      throw new HttpsError("permission-denied", "Unauthorized access to order");
    }

    /* ==========================================================
       PRICING INTEGRITY
    ========================================================== */
    if (
      typeof order.amount !== "number" ||
      typeof order.total !== "number" ||
      order.amount <= 0 ||
      order.total <= 0
    ) {
      console.error("INVALID ORDER PRICING", order);
      throw new HttpsError(
        "failed-precondition",
        "Order pricing is invalid. Please recreate the order."
      );
    }

    if (!Array.isArray(order.items) || order.items.length === 0) {
      throw new HttpsError("failed-precondition", "Order has no items");
    }

    /* ==========================================================
       STRIPE INIT
    ========================================================== */
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());

    /* ==========================================================
       BUILD LINE ITEMS
    ========================================================== */
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      order.items.map((item: any) => {
        const unitPrice = item.unitPrice ?? item.price;

        if (typeof unitPrice !== "number" || unitPrice <= 0) {
          throw new HttpsError(
            "failed-precondition",
            "Invalid item pricing detected"
          );
        }

        return {
          quantity: item.qty,
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(unitPrice * 100),
          },
        };
      });

    if (order.tax > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: { name: "Sales Tax" },
          unit_amount: Math.round(order.tax * 100),
        },
      });
    }

    if (order.shipping > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping" },
          unit_amount: Math.round(order.shipping * 100),
        },
      });
    }

    /* ==========================================================
       ✅ CORRECT REDIRECT ORIGIN (THIS IS THE FIX)
    ========================================================== */
    const origin =
      req.rawRequest?.headers?.origin ||
      req.rawRequest?.headers?.referer?.split("/").slice(0, 3).join("/") ||
      "https://bozuishopworld.web.app";

    /* ==========================================================
       CREATE STRIPE SESSION
    ========================================================== */
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      metadata: {
        orderId,
        uid,
      },
      success_url: `${origin}/order/${orderId}`,
      cancel_url: `${origin}/cart`,
    });

    /* ==========================================================
       RETURN
    ========================================================== */
    return {
      url: session.url,
    };
  }
);























/* ==========================================================
   5) STRIPE WEBHOOK
========================================================== */
export const stripeWebhook = onRequest(
  {
    region: "us-central1",
    secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET],
  },
  async (req, res) => {
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers["stripe-signature"] as string,
        STRIPE_WEBHOOK_SECRET.value()
      );
    } catch (err: any) {
      console.error("❌ Stripe signature verification failed:", err.message);
      res.status(400).send("Invalid signature");
      return;
    }

    /* ----------------------------
       CHECKOUT COMPLETED
    ----------------------------- */
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = session.metadata?.orderId;
      const paymentIntentId = session.payment_intent as string | null;

      if (orderId && paymentIntentId) {
        await db.doc(`orders/${orderId}`).set(
          {
            status: "paid",
            paymentIntentId,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    }

    /* ----------------------------
       PAYMENT INTENT SUCCEEDED
    ----------------------------- */
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.orderId;

      if (orderId) {
        await db.doc(`orders/${orderId}`).set(
          {
            status: "paid",
            paymentIntentId: pi.id,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    }

    res.json({ received: true });
  }
);





/* ==========================================================
   6) ADMIN PAYOUT
========================================================== */
export const createManualPayout = onCall(
  { region: "us-central1", secrets: [STRIPE_SECRET_KEY] },
  async (req) => {
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());


    const uid = req.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Admin only");

    const user = await db.collection("users").doc(uid).get();
    if (user.data()?.role !== "admin")
      throw new HttpsError("permission-denied", "Admins only");

    const amount = req.data.amount;

    const payout = await stripe.payouts.create({
      amount,
      currency: "usd",
    });

    return { payoutId: payout.id, status: payout.status };
  }
);

/* ==========================================================
   7) REFUND
========================================================== */
export const issueRefund = onCall(
  { region: "us-central1", secrets: [STRIPE_SECRET_KEY] },
  async (req) => {
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());


    const uid = req.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Admin only");

    const user = await db.collection("users").doc(uid).get();
    if (user.data()?.role !== "admin")
      throw new HttpsError("permission-denied", "Admins only");

    const refund = await stripe.refunds.create({
      payment_intent: req.data.paymentIntentId,
    });

    return { refundId: refund.id, status: refund.status };
  }
);

/* ==========================================================
   8) ADJUST STOCK
========================================================== */
export const adjustStock = onCall(
  { region: "us-central1" },
  async (req) => {
    const uid = req.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Admin only");

    const user = await db.collection("users").doc(uid).get();
    if (user.data()?.role !== "admin")
      throw new HttpsError("permission-denied", "Admins only");

    const { productId, change } = req.data;

    const ref = db.collection("products").doc(productId);
    const snap = await ref.get();

    const newStock = (snap.data()?.stock || 0) + change;
    await ref.update({ stock: newStock });

    return { newStock };
  }
);

/* ==========================================================
   9) UPDATE PRODUCT RATING
========================================================== */
export const updateProductRating = onDocumentWritten(
  "reviews/{reviewId}",
  async (event) => {
    const after = event.data?.after?.data();
    if (!after) return;

    const productId = after.productId;

    const reviewsSnap = await db
      .collection("reviews")
      .where("productId", "==", productId)
      .get();

    const reviews = reviewsSnap.docs.map((d) => d.data());
    const count = reviews.length;
    const avg =
      count === 0
        ? 0
        : reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / count;

    await db.collection("products").doc(productId).update({
      averageRating: avg,
      reviewCount: count,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
);

/* ==========================================================
   10) ADMIN REPLY TO REVIEW
========================================================== */
export const replyToReview = onRequest(
  { region: "us-central1" },
  async (req, res): Promise<void> => {
    corsHandler(req, res, async () => {
      try {
        if (req.method === "OPTIONS") {
          res.set("Access-Control-Allow-Origin", "*");
          res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
          );
          res.status(204).send("");
          return;
        }

        res.set("Access-Control-Allow-Origin", "*");

        const authHeader = req.headers.authorization;
        if (!authHeader) {
          res.status(401).json({ error: "Missing Authorization header" });
          return;
        }

        const idToken = authHeader.split(" ")[1];
        const decoded = await admin.auth().verifyIdToken(idToken);

        const userSnap = await db.collection("users").doc(decoded.uid).get();
        if (userSnap.data()?.role !== "admin") {
          res.status(403).json({ error: "Admins only" });
          return;
        }

        const { reviewId, replyText } = req.body;

        await db.collection("reviews").doc(reviewId).update({
          sellerReply: replyText,
          repliedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.json({ success: true });
      } catch (err: any) {
        console.error("replyToReview ERROR:", err);
        res.status(500).json({ error: err.message });
      }
    });
    return;
  }
);
/* ==========================================================
   11) Ai
========================================================== */
export { generateProductDescription } from "./ai";
/* ==========================================================
   AUTO-DISABLE EXPIRED CAMPAIGNS
========================================================== */
export const expireCampaigns = onSchedule(
  { schedule: "every 5 minutes", region: "us-central1" },
  async () => {
    const now = Date.now();
    const snap = await db.collection("campaigns").where("active", "==", true).get();
    const batch = db.batch();

    snap.forEach(doc => {
      const c = doc.data();
      if (c.type === "FLASH_SALE" && c.config?.endAt && now > Number(c.config.endAt)) {
        batch.update(doc.ref, { active: false });
      }
    });

    await batch.commit();
  }
);
/* ===========================================================
   UTIL — APPLY CAMPAIGNS (SERVER SOURCE OF TRUTH)
=========================================================== */
async function applyCampaigns(items: CartItem[], uid: string) {
  const snap = await db.collection("campaigns").where("active", "==", true).get();

  let subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  let discount = 0;
  let updated = items.map(i => ({ ...i }));

  for (const doc of snap.docs) {
    const c = doc.data();
    const applicable = updated.filter(i => c.productIds?.includes(i.id));

    if (applicable.length === 0 && c.type !== "SPEND_AND_SAVE") continue;

    switch (c.type) {
      case "FLASH_SALE":
      case "BUY_X_GET_Y_PERCENT":
        applicable.forEach(i => {
          discount += i.price * i.qty * (c.config.discountPercent / 100);
          i.campaignId = doc.id;
        });
        break;

      case "FIRST_PURCHASE_DISCOUNT": {
        const prev = await db
          .collection("orders")
          .where("uid", "==", uid)
          .where("status", "==", "paid")
          .limit(1)
          .get();
        if (prev.empty) {
          discount += subtotal * (c.config.discountPercent / 100);
        }
        break;
      }

      case "SPEND_AND_SAVE":
        if (subtotal >= c.config.minAmount) {
          discount += c.config.discountAmount;
        }
        break;
    }
  }

  if (discount > 0) {
    const ratio = (subtotal - discount) / subtotal;
    updated = updated.map(i => ({
      ...i,
      unitPrice: Math.round(i.price * ratio * 100) / 100,
    }));
  } else {
    updated = updated.map(i => ({ ...i, unitPrice: i.price }));
  }

  const finalTotal = updated.reduce(
    (s, i) => s + (i.unitPrice ?? i.price) * i.qty,
    0
  );

  return {
    items: updated,
    subtotal,
    discount,
    total: Math.round(finalTotal * 100) / 100,
  };
}








/* ===========================================================
   UTIL — VERIFY & RESERVE STOCK (TRANSACTION)
=========================================================== */

function calculateShipping(subtotal: number): number {
  // Free shipping over $50
  return subtotal >= 50 ? 0 : 5.99;
}

function calculateTax(amount: number, country?: string): number {
  const normalized = normalizeCountry(country);

  if (normalized === "US") {
    return Math.round(amount * 0.07 * 100) / 100; // 7% US tax
  }

  return 0;
}
/* ==========================================================
   ADMIN — BACKFILL ORDERS
========================================================== */
export const backfillOrders = onCall(
  { region: "us-central1" },
  async (req) => {
    const uid = req.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Admin only");

    const user = await db.collection("users").doc(uid).get();
    if (user.data()?.role !== "admin")
      throw new HttpsError("permission-denied", "Admins only");

    const snap = await db.collection("orders").get();
    let updated = 0;

    for (const d of snap.docs) {
      if (!d.data().amount && typeof d.data().total === "number") {
        await d.ref.update({ amount: Math.round(d.data().total * 100) });
        updated++;
      }
    }

    return { updated };
  }
);



/* ==========================================================
   EXECUTE REFUND (ADMIN ONLY — FINAL, SAFE)
========================================================== */
export const executeRefund = onCall(
  { region: "us-central1", secrets: [STRIPE_SECRET_KEY] },
  async (req) => {
    // ✅ DO NOT set apiVersion (fixes TS error)
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());

    const uid = req.auth?.uid;
    const { requestId } = req.data;

    if (!uid) {
      throw new HttpsError("unauthenticated", "Login required");
    }

    if (!requestId) {
      throw new HttpsError("invalid-argument", "Missing requestId");
    }

    const db = admin.firestore();

    /* -------------------------------
       VERIFY ADMIN
    -------------------------------- */
    const adminSnap = await db.doc(`users/${uid}`).get();
    if (!adminSnap.exists || adminSnap.data()?.role !== "admin") {
      throw new HttpsError("permission-denied", "Admins only");
    }

    /* -------------------------------
       LOAD REFUND REQUEST
    -------------------------------- */
    const refundRef = db.doc(`refundRequests/${requestId}`);
    const refundSnap = await refundRef.get();

    if (!refundSnap.exists) {
      throw new HttpsError("not-found", "Refund request not found");
    }

    const refund = refundSnap.data()!;

    if (refund.status !== "pending") {
      throw new HttpsError(
        "failed-precondition",
        "Refund already processed"
      );
    }

    if (!refund.paymentIntentId) {
      throw new HttpsError(
        "failed-precondition",
        "Missing paymentIntentId"
      );
    }

    /* -------------------------------
       MARK AS PROCESSING
    -------------------------------- */
    await refundRef.update({
      status: "processing",
      processingAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    try {
      /* -------------------------------
         STRIPE REFUND (FULL)
      -------------------------------- */
      const stripeRefund = await stripe.refunds.create({
        payment_intent: refund.paymentIntentId,
      });

      /* -------------------------------
         FINALIZE
      -------------------------------- */
      await refundRef.update({
        status: "refunded",
        stripeRefundId: stripeRefund.id,
        refundedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db.doc(`orders/${refund.orderId}`).update({
        status: "refunded",
        refundStatus: "refunded",
      });

      return {
        success: true,
        refundId: stripeRefund.id,
      };
    } catch (err: any) {
      console.error("❌ executeRefund failed:", err);

      await refundRef
        .update({
          status: "failed",
          error: err.message,
        })
        .catch(() => {});

      throw new HttpsError(
        "internal",
        err.message || "Refund failed"
      );
    }
  }
);




