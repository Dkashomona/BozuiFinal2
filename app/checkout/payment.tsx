// app/checkout/payment.tsx

import { useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { auth } from "../../src/services/firebase";
import { createCheckoutSession } from "../../api/orders";

export default function PaymentScreen() {
  const local = useLocalSearchParams();

  useEffect(() => {
    async function startPayment() {
      // 1️⃣ Try router params first (Expo Router way)
      let orderId: string | null = null;

      if (local.orderId) {
        orderId = String(local.orderId);
      }

      // 2️⃣ Fallback: URL params (web browser way)
      if (!orderId && typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        orderId = params.get("orderId");
      }

      // 3️⃣ If still missing → routing issue
      if (!orderId) {
        console.error("❌ Payment screen: orderId not found.");
        alert("Missing order ID.");
        router.back();
        return;
      }

      // 4️⃣ Validate user
      const user = auth.currentUser;
      if (!user) {
        alert("You must log in first.");
        router.push("/login");
        return;
      }

      try {
        console.log("🔥 Creating Stripe session for order:", orderId);

        const session = await createCheckoutSession({
          orderId,
          uid: user.uid, // Ensure correct UID is passed
        });

        if (!session || !session.url) {
          console.error("❌ Stripe session error:", session);
          alert("Failed to create checkout session.");
          return;
        }

        // 5️⃣ Redirect to Stripe checkout
        window.location.href = session.url;
      } catch (error) {
        console.error("❌ Payment error:", error);
        alert("Failed to start payment.");
      }
    }

    startPayment();
  }, [local]);

  return (
    <div style={{ marginTop: 120, textAlign: "center" }}>
      <div
        style={{
          width: 50,
          height: 50,
          borderWidth: 5,
          borderStyle: "solid",
          borderRadius: "50%",
          borderColor: "#e67e22 transparent #e67e22 transparent",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px",
        }}
      />
      <h2>Redirecting to Stripe…</h2>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
