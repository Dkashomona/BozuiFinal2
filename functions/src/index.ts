/*

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

async function getOrCreateCustomer(uid: string) {
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();

  if (snap.exists && snap.data()?.stripeCustomerId) {
    return snap.data()?.stripeCustomerId;
  }

  const customer = await stripe.customers.create({ metadata: { uid } });
  await ref.set({ stripeCustomerId: customer.id }, { merge: true });
  return customer.id;
}

/* ---------------------------------------------------------
   CREATE ORDER (WEB)
--------------------------------------------------------- *
export const createOrder = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    const { items, amount, address, uid } = req.body;

    if (!uid) {
      res.status(400).json({ error: "Missing UID" });
      return;
    }

    const orderRef = db.collection("orders").doc();
    const orderId = orderRef.id;

    orderRef
      .set({
        orderId,
        uid,
        items,
        amount,
        address,
        status: "pending",
        paymentIntentId: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        res.json({ orderId });
      })
      .catch((err) => {
        console.error("createOrder error:", err);
        res.status(500).send(err.message);
      });
  });
});

/* ---------------------------------------------------------
   MOBILE PAYMENT SHEET (onCall)
--------------------------------------------------------- *
export const createPaymentSheet = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;

  if (!uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in"
    );
  }

  const { orderId } = data;
  if (!orderId) {
    throw new functions.https.HttpsError("invalid-argument", "orderId missing");
  }

  const orderSnap = await db.collection("orders").doc(orderId).get();
  if (!orderSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Order not found");
  }

  const amount = orderSnap.data()!.amount;
  const customerId = await getOrCreateCustomer(uid);

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customerId },
    { apiVersion: "2024-06-20" }
  );

  const pi = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    customer: customerId,
    metadata: { orderId, uid },
    automatic_payment_methods: { enabled: true },
  });

  await orderSnap.ref.update({ paymentIntentId: pi.id });

  return {
    paymentIntent: pi.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customerId,
  };
});

/* ---------------------------------------------------------
   WEB CHECKOUT SESSION
--------------------------------------------------------- *
export const createCheckoutSession = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    const { orderId, uid } = req.body;

    if (!orderId || !uid) {
      res.status(400).send("Missing orderId or uid");
      return;
    }

    db.collection("orders")
      .doc(orderId)
      .get()
      .then(async (snap) => {
        if (!snap.exists) {
          res.status(404).send("Order not found");
          return;
        }

        const amount = snap.data()!.amount;
        const customerId = await getOrCreateCustomer(uid);

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          customer: customerId,
          metadata: { orderId, uid },
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: { name: `Order #${orderId}` },
                unit_amount: amount,
              },
              quantity: 1,
            },
          ],
          success_url: `http://localhost:8081/order/${orderId}`,
          cancel_url: `http://localhost:8081/checkout/payment?cancel=1`,
        });

        res.json({ url: session.url });
      })
      .catch((err) => {
        console.error("createCheckoutSession error:", err);
        res.status(500).send(err.message);
      });
  });
});

/* ---------------------------------------------------------
   STRIPE WEBHOOK
--------------------------------------------------------- *
export const stripeWebhook = functions.https.onRequest((req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers["stripe-signature"] as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const paid = async (oid: string) => {
    await db.collection("orders").doc(oid).update({
      status: "paid",
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  };

  const type = event.type;

  if (type === "checkout.session.completed") {
    paid((event.data.object as any).metadata.orderId);
  }

  if (type === "payment_intent.succeeded") {
    paid((event.data.object as any).metadata.orderId);
  }

  res.json({ received: true });
});
*/



/* ===========================================================
   FIREBASE FUNCTIONS — FINAL FULL VERSION (BATCH 1–5)
   Includes: Orders, Payments, Web Checkout, Inventory Logs,
   Adjust Stock, Shipping Zones, Notifications, Payouts, Refunds
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

// CORS for REST
const corsHandler = cors({ origin: true });

/* --------------------------------------------------------
   UTIL — GET OR CREATE STRIPE CUSTOMER
-------------------------------------------------------- */
async function getOrCreateCustomer(uid: string) {
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();

  if (snap.exists && snap.data()?.stripeCustomerId) {
    return snap.data()!.stripeCustomerId;
  }

  const customer = await stripe.customers.create({ metadata: { uid } });
  await ref.set({ stripeCustomerId: customer.id }, { merge: true });

  return customer.id;
}

/* --------------------------------------------------------
   UTIL — SEND ADMIN PUSH NOTIFICATION (Expo Push Token)
-------------------------------------------------------- */
async function sendAdminNotification(message: string) {
  const devices = await db.collection("admin_devices").get();
  if (devices.empty) return;

  const payload = devices.docs.map((d) => ({
    to: d.data().expoPushToken,
    sound: "default",
    title: "🟧 Admin Alert",
    body: message,
  }));

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/* --------------------------------------------------------
   1) CREATE ORDER (WEB & APP)
-------------------------------------------------------- */
export const createOrder = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { items, amount, address, uid } = req.body;

      if (!uid) return res.status(400).json({ error: "Missing UID" });

      const orderRef = db.collection("orders").doc();
      const orderId = orderRef.id;

      await orderRef.set({
        orderId,
        uid,
        items,
        amount,
        address,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentIntentId: null,
      });

      // Notify admin
      await sendAdminNotification(`🛒 New Order #${orderId} received`);

      res.json({ orderId });
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  });
});

/* --------------------------------------------------------
   2) CREATE PAYMENT SHEET (Mobile)
-------------------------------------------------------- */
export const createPaymentSheet = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Login required");

  const { orderId } = data;
  if (!orderId) throw new functions.https.HttpsError("invalid-argument", "Missing orderId");

  const orderSnap = await db.collection("orders").doc(orderId).get();
  if (!orderSnap.exists) throw new functions.https.HttpsError("not-found", "Order missing");

  const amount = orderSnap.data()!.amount;

  const customerId = await getOrCreateCustomer(uid);

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customerId },
    { apiVersion: "2024-06-20" }
  );

  const pi = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    customer: customerId,
    metadata: { orderId, uid },
    automatic_payment_methods: { enabled: true },
  });

  await orderSnap.ref.update({ paymentIntentId: pi.id });

  return {
    paymentIntent: pi.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customerId,
  };
});

/* --------------------------------------------------------
   3) WEB CHECKOUT SESSION (Stripe Checkout)
-------------------------------------------------------- */
export const createCheckoutSession = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    const { orderId, uid } = req.body;

    if (!orderId || !uid) return res.status(400).send("Missing params");

    const snap = await db.collection("orders").doc(orderId).get();
    if (!snap.exists) return res.status(404).send("Order not found");

    const amount = snap.data()!.amount;
    const customerId = await getOrCreateCustomer(uid);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      metadata: { orderId, uid },
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Order #${orderId}` },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `https://yourapp.com/order/${orderId}`,
      cancel_url: `https://yourapp.com/checkout/payment?cancel=1`,
    });

    res.json({ url: session.url });
  });
});

/* --------------------------------------------------------
   4) STRIPE WEBHOOK → CONFIRM PAYMENT
-------------------------------------------------------- */
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

    await sendAdminNotification(`💳 Order #${orderId} marked as PAID`);
  }

  const type = event.type;

  if (type === "checkout.session.completed") {
    await markPaid((event.data.object as any).metadata.orderId);
  }

  if (type === "payment_intent.succeeded") {
    await markPaid((event.data.object as any).metadata.orderId);
  }

  res.json({ received: true });
});

/* --------------------------------------------------------
   5) ADMIN — MANUAL PAYOUT
-------------------------------------------------------- */
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

/* --------------------------------------------------------
   6) REFUND ENDPOINT (Basic)
-------------------------------------------------------- */
export const issueRefund = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Admin only");

  const adminDoc = await db.collection("users").doc(uid).get();
  if (adminDoc.data()?.role !== "admin")
    throw new functions.https.HttpsError("permission-denied", "Admins only");

  const { paymentIntentId } = data;
  if (!paymentIntentId)
    throw new functions.https.HttpsError("invalid-argument", "Missing PI ID");

  const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });

  return { refundId: refund.id, status: refund.status };
});

/* --------------------------------------------------------
   7) INVENTORY — ADJUST STOCK
-------------------------------------------------------- */
export const adjustStock = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Admin must be logged in");

  const user = await db.collection("users").doc(uid).get();
  if (user.data()?.role !== "admin")
    throw new functions.https.HttpsError("permission-denied", "You are not an admin");
;

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

/* --------------------------------------------------------
   8) SHIPPING ZONES (Add + Edit)
-------------------------------------------------------- */
export const saveShippingZone = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
;

  const adminDoc = await db.collection("users").doc(uid).get();
  if (adminDoc.data()?.role !== "admin")
    throw  new functions.https.HttpsError("permission-denied", "You are not an admin");


  const { id, name, price, regions } = data;

  if (id) {
    await db.collection("shipping_zones").doc(id).update({ name, price, regions });
    return { updated: id };
  }

  const newRef = await db.collection("shipping_zones").add({
    name,
    price,
    regions,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { created: newRef.id };
});

/* --------------------------------------------------------
   9) ANALYTICS HELPERS
-------------------------------------------------------- */
export const analyticsTotals = functions.https.onCall(async () => {
  const orders = await db.collection("orders").get();
  let totalRevenue = 0;

  orders.forEach((d) => {
    if (d.data().status === "paid") {
      totalRevenue += d.data().amount;
    }
  });

  return {
    orders: orders.size,
    revenue: totalRevenue,
  };
});
