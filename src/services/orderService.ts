import { db, auth } from "./firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";

export async function saveOrderToFirestore(order: any) {
  const user = auth.currentUser!;
  const orderId = doc(db, "orders", crypto.randomUUID()).id;

  await setDoc(doc(db, "orders", orderId), {
    userId: user.uid,
    items: order.items,
    amount: order.amount,
    status: "processing",
    paymentIntentId: order.paymentIntentId,
    createdAt: Timestamp.now(),
  });

  return orderId;
}
