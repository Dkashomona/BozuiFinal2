import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");

export const createPaymentIntent = onCall(
  {
    region: "us-central1",
    secrets: [STRIPE_SECRET_KEY],
  },
  async (req) => {
    const stripeSecret = req.secrets?.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      throw new HttpsError("failed-precondition", "Missing Stripe secret.");
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2023-10-16",
    });

    if (!req.data?.amount) {
      throw new HttpsError("invalid-argument", "Missing amount");
    }

    const amount = Math.round(Number(req.data.amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }
);
