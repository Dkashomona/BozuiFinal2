// src/services/orderService.ts (REPLACED VERSION)

import { functions, auth } from "./firebase";
import { httpsCallable } from "firebase/functions";

/**
 * Client-side order creation
 * 🔒 Firestore writes are SERVER-ONLY
 */
export async function saveOrderToFirestore(params: {
  items: any[];
  address: any;
}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Ensure fresh token (important on Web)
  await user.getIdToken(true);

  const createOrderFn = httpsCallable(functions, "createOrder");

  const res = await createOrderFn({
    items: params.items,
    address: params.address,
  });

  return (res.data as { orderId: string }).orderId;
}
