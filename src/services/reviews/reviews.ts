import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

export async function addReview(productId: string, review: any) {
  return await addDoc(collection(db, "reviews"), {
    productId,
    ...review,
  });
}

export async function getReviews(productId: string) {
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function replyToReview(reviewId: string, reply: string) {
  await updateDoc(doc(db, "reviews", reviewId), {
    reply,
    repliedAt: Date.now(),
  });
}
