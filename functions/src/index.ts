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
--------------------------------------------------------- */
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
--------------------------------------------------------- */
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
--------------------------------------------------------- */
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
--------------------------------------------------------- */
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
