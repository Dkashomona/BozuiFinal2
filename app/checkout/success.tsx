// app/checkout/success.tsx

import { useEffect, useState } from "react";
import { db } from "../../src/services/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useCartStore } from "../../src/store/cartStore";
import { router } from "expo-router";

export default function SuccessScreen() {
  const [msg, setMsg] = useState("Validating payment...");
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    async function finalizePayment() {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get("session_id");

      if (!orderId) {
        setMsg("Missing payment session.");
        return;
      }

      try {
        // Mark order as paid
        await updateDoc(doc(db, "orders", orderId), { status: "paid" });

        // Clear cart
        clearCart();

        setMsg("🎉 Payment successful! Redirecting to order details...");

        // Redirect to order details page
        setTimeout(() => {
          router.replace(`/order/${orderId}`);
        }, 1500);
      } catch (err) {
        console.error(err);
        setMsg("Error verifying payment.");
      }
    }

    finalizePayment();
  }, [clearCart]);

  return (
    <div style={{ marginTop: 100, textAlign: "center" }}>
      <h1>Payment Success</h1>
      <p>{msg}</p>
    </div>
  );
}
