import { db, auth } from "../../services/firebase";
import { doc, getDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";

/**
 * Like a review (one-time only)
 */
export async function likeReview(reviewId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in.");

  const ref = doc(db, "reviews", reviewId);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Review not found.");

  const data = snap.data();

  // Prevent liking twice
  if (data.likedUsers?.includes(user.uid)) {
    return { alreadyLiked: true };
  }

  await updateDoc(ref, {
    likes: increment(1),
    likedUsers: arrayUnion(user.uid),
  });

  return { success: true };
}
