// Import Firebase Functions SDK
const functions = require("firebase-functions");

// Import Stripe SDK with your secret key
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Define the callable function
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  // Convert amount to cents
  const amount = Math.round(data.amount * 100);

  // Create a PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
  });

  // Return client secret to client
  return {
    clientSecret: paymentIntent.client_secret,
  };
});