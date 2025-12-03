import { db, auth } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function saveCart(cart: any) {
  const user = auth.currentUser;
  if (!user) return;

  await setDoc(doc(db, "carts", user.uid), {
    updatedAt: Date.now(),
    items: cart,
  });
}

export async function loadCart() {
  const user = auth.currentUser;
  if (!user) return [];

  const snap = await getDoc(doc(db, "carts", user.uid));
  return snap.exists() ? snap.data().items : [];
}
