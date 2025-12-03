import { httpsCallable } from "firebase/functions";
import { functions } from "../src/services/firebase";
import { CartItem } from "@/src/store/cartStore";

export async function createOrder(items: CartItem[], subtotal: number, payload: {
  items: any[];
  amount: number;
  address: any;
  uid: string;
}) {
  const res = await fetch(
    "https://us-central1-bozuishopworld.cloudfunctions.net/createOrder",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  return await res.json();
}

export async function createPaymentSheet(params: { orderId: string }) {
  const fn = httpsCallable(functions, "createPaymentSheet");
  const res: any = await fn(params);
  return res.data;
}

export async function createCheckoutSession(params: {
  orderId: string;
  uid: string;
}) {
  const res = await fetch(
    "https://us-central1-bozuishopworld.cloudfunctions.net/createCheckoutSession",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }
  );
  return await res.json();
}
