/* ===========================================================
   FIREBASE STRIPE FUNCTIONS — TS-CLEAN VERSION
   ✔ No Response return errors
   ✔ Stripe checkout and payment sheet fixed
=========================================================== */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import cors from "cors";

admin.initializeApp();
const db = admin.firestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const corsHandler = cors({ origin: true });

/* ---------------------------------------------------------
   UTIL — GET OR CREATE CUSTOMER
--------------------------------------------------------- */
async function getOrCreateCustomer(uid: string): Promise<string> {
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
async function sendAdminNotification(message: string): Promise<void> {
  const snap = await db.collection("admin_devices").get();
  if (snap.empty) return;

  const payload = snap.docs.map((d) => ({
    to: d.data().expoPushToken,
    sound: "default",
    title: "Admin Alert",
    body: message,
  }));

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/* ---------------------------------------------------------
   1) CREATE ORDER
--------------------------------------------------------- */
export const createOrder = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { items, amount, address, uid } = req.body;

      if (!uid) {
        res.status(400).json({ error: "Missing UID" });
        return;
      }

      // ALWAYS SAVE AS CENTS
      const amountInCents = Math.round(Number(amount) * 100);

      const orderId = db.collection("orders").doc().id;

      await db.collection("orders").doc(orderId).set({
        orderId,
        uid,
        items,
        amount: amountInCents,   // ← IMPORTANT
        address,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentIntentId: null,
      });

      res.json({ orderId });
      return;
    } catch (err: any) {
      console.error("createOrder error:", err);
      res.status(500).send(err.message);
      return;
    }
  });
});


/* ---------------------------------------------------------
   2) PAYMENT SHEET (MOBILE)
--------------------------------------------------------- */
export const createPaymentSheet = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Login required");

  const { orderId } = data;
  if (!orderId)
    throw new functions.https.HttpsError("invalid-argument", "Missing orderId");

  const snap = await db.collection("orders").doc(orderId).get();
  if (!snap.exists)
    throw new functions.https.HttpsError("not-found", "Order not found");

  const order = snap.data()!;
  const customerId = await getOrCreateCustomer(uid);

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
});

/* ---------------------------------------------------------
   3) WEB CHECKOUT SESSION
--------------------------------------------------------- */
export const createCheckoutSession = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { orderId, uid } = req.body;

      if (!orderId || !uid) {
        res.status(400).send("Missing orderId or uid");
        return;
      }

      const snap = await db.collection("orders").doc(orderId).get();

      if (!snap.exists) {
        res.status(404).send("Order not found");
        return;
      }

      // ⭐ FIX: safely extract order data
      const order = snap.data();
      if (!order) {
        res.status(500).send("Order data is missing");
        return;
      }

      const items = order.items;
      if (!items || items.length === 0) {
        res.status(400).send("Order has no items");
        return;
      }

      // ⭐ FIX: Validate each item & price
      const lineItems = items.map((item: any) => {
        const price = Number(item.price);

        if (!price || isNaN(price)) {
          console.error("Invalid price in item:", item);
          throw new Error(`Invalid price for item ${item?.name ?? "Unnamed product"}`);
        }

        return {
          quantity: item.qty ?? 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name || "Product",
            },
            unit_amount: Math.round(price * 100), // convert to cents
          },
        };
      });

      const customerId = await getOrCreateCustomer(uid);

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId,
        metadata: { orderId, uid },
        line_items: lineItems,
        success_url: `http://localhost:8081/order/${orderId}`,
        cancel_url: `http://localhost:8081/checkout/payment?cancel=1`,
      });

      res.json({ url: session.url });
      return;

    } catch (err: any) {
      console.error("🔥 Stripe Checkout Error:", err);
      res.status(500).json({ error: err.message });
      return;
    }
  });
});


/* ---------------------------------------------------------
   4) STRIPE WEBHOOK
--------------------------------------------------------- */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers["stripe-signature"] as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    res.status(400).send(`Webhook error: ${err.message}`);
    return;
  }

  async function markPaid(orderId: string) {
    await db.collection("orders").doc(orderId).update({
      status: "paid",
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await sendAdminNotification(`💳 Order #${orderId} PAID`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      await markPaid((event.data.object as any).metadata.orderId);
      break;

    case "payment_intent.succeeded":
      await markPaid((event.data.object as any).metadata.orderId);
      break;
  }

  res.json({ received: true });
  return;
});

/* ---------------------------------------------------------
   5) ADMIN PAYOUT
--------------------------------------------------------- */
export const createManualPayout = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Admin only");

  const user = await db.collection("users").doc(uid).get();
  if (user.data()?.role !== "admin")
    throw new functions.https.HttpsError("permission-denied", "Admins only");

  const { amount } = data;
  if (!amount || amount <= 0)
    throw new functions.https.HttpsError("invalid-argument", "Invalid amount");

  const payout = await stripe.payouts.create({
    amount,
    currency: "usd",
  });

  return { payoutId: payout.id, status: payout.status };
});

/* ---------------------------------------------------------
   6) REFUND
--------------------------------------------------------- */
export const issueRefund = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Admin only");

  const user = await db.collection("users").doc(uid).get();
  if (user.data()?.role !== "admin")
    throw new functions.https.HttpsError("permission-denied", "Admins only");

  const { paymentIntentId } = data;
  if (!paymentIntentId)
    throw new functions.https.HttpsError("invalid-argument", "Missing paymentIntentId");

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
  });

  return { refundId: refund.id, status: refund.status };
});

/* ---------------------------------------------------------
   7) ADJUST STOCK
--------------------------------------------------------- */
export const adjustStock = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Admin only");

  const user = await db.collection("users").doc(uid).get();
  if (user.data()?.role !== "admin")
    throw new functions.https.HttpsError("permission-denied", "Admins only");

  const { productId, change } = data;

  const ref = db.collection("products").doc(productId);
  const snap = await ref.get();

  const newStock = (snap.data()?.stock || 0) + change;

  await ref.update({ stock: newStock });

  await db.collection("inventory_logs").add({
    productId,
    change,
    newStock,
    admin: uid,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { newStock };
});
