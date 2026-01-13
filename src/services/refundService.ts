import {
  setDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export async function requestRefund({
  orderId,
  reason,
}: {
  orderId: string;
  reason?: string;
}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Not authenticated");
  }

  /* ----------------------------------
     LOAD ORDER (SOURCE OF TRUTH)
  ---------------------------------- */
  const orderRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    throw new Error("Order not found");
  }

  const order = orderSnap.data();

  if (!order.paymentIntentId) {
    throw new Error("Order missing paymentIntentId");
  }

  /* ----------------------------------
     ONE REFUND PER ORDER PER USER
  ---------------------------------- */
  const refundId = `${user.uid}_${orderId}`;

  /* ----------------------------------
     CREATE REFUND REQUEST
  ---------------------------------- */
  return setDoc(doc(db, "refundRequests", refundId), {
    orderId,
    userId: user.uid,

    // 🔑 REQUIRED FOR STRIPE
    paymentIntentId: order.paymentIntentId,

    // 💰 OPTIONAL BUT STRONGLY RECOMMENDED
    amount: order.total,

    reason: reason || "",
    status: "pending",

    createdAt: serverTimestamp(),
  });
}
