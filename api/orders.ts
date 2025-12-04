// api/orders.ts

import { auth , functions } from "../src/services/firebase";
import { CartItem } from "@/src/store/cartStore";

/* ----------------------------------------------------------
   2) MOBILE PAYMENT SHEET (Callable)
-----------------------------------------------------------*/
import { httpsCallable } from "firebase/functions";

/* ----------------------------------------------------------
   1) CREATE ORDER  (REST Endpoint)
-----------------------------------------------------------*/
export async function createOrder(
  items: CartItem[],
  amount: number,
  address: any
) {
  const user = auth.currentUser;

  if (!user) throw new Error("User not logged in");

  const payload = {
    userId: user.uid,
    items,
    amount,
    address,
  };

  const res = await fetch(
    "https://us-central1-bozuishopworld.cloudfunctions.net/createOrder",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) throw new Error("Failed to create order");

  return await res.json(); // { orderId }
}


export async function createPaymentSheet(params: { orderId: string }) {
  const fn = httpsCallable(functions, "createPaymentSheet");
  const res: any = await fn(params);
  return res.data;
}

/* ----------------------------------------------------------
   3) WEB CHECKOUT SESSION (Stripe Checkout)
   Used by /checkout/payment.tsx
-----------------------------------------------------------*/
export async function createCheckoutSession(params: { orderId: string; uid: string })  {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not logged in");
  }

  const payload = {
    orderId: params.orderId,
    uid: user.uid,
  };

  const res = await fetch(
    "https://us-central1-bozuishopworld.cloudfunctions.net/createCheckoutSession",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    console.error(await res.text());
    throw new Error("Failed to create checkout session");
  }

  return await res.json(); // { url }
}

/* ----------------------------------------------------------
   4) Direct Version — if you want to bypass authStore/params
-----------------------------------------------------------*/
export async function createCheckoutSessionDirect(orderId: string) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not logged in");
  }

  const payload = { orderId, uid: user.uid };

  const res = await fetch(
    "https://us-central1-bozuishopworld.cloudfunctions.net/createCheckoutSession",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) throw new Error("Failed to create checkout session");

  return await res.json(); // { url }
}
