// api/orders.ts

import { functions, auth } from "@/src/services/firebase";
import { CartItem } from "@/src/store/cartStore";
import { httpsCallable } from "firebase/functions";

/* ==========================================================
   INTERNAL: ENSURE AUTH TOKEN IS FRESH
========================================================== */
async function ensureAuth() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Force token refresh to avoid stale auth on Web
  await user.getIdToken(true);
}

/* ==========================================================
   1) CREATE ORDER (CALLABLE — SERVER IS SOURCE OF TRUTH)
========================================================== */
export async function createOrder(
  items: CartItem[],
  address: any
) {
  await ensureAuth();

  const fn = httpsCallable(functions, "createOrder");
  const res = await fn({ items, address });

  return res.data as { orderId: string };
}

/* ==========================================================
   2) MOBILE PAYMENT SHEET (CALLABLE)
========================================================== */
export async function createPaymentSheet(params: { orderId: string }) {
  await ensureAuth();

  const fn = httpsCallable(functions, "createPaymentSheet");
  const res = await fn(params);

  return res.data;
}

/* ==========================================================
   3) WEB STRIPE CHECKOUT (CALLABLE — CORRECT)
========================================================== */
export async function createCheckoutSession(orderId: string) {
  await ensureAuth();

  const fn = httpsCallable(functions, "createCheckoutSession");
  const res = await fn({ orderId });

  return res.data as { url: string };
}
