import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface UserRole {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer";
  createdAt: number;
}

/** Create user in Firestore after signup */
export async function createUserDocument(uid: string, email: string, name: string) {
  const ref = doc(db, "users", uid);

  const payload: UserRole = {
    id: uid,
    email,
    name,
    role: "customer",        // default role
    createdAt: Date.now(),
  };

  await setDoc(ref, payload);
}

/** Signup */
export async function register(email: string, password: string, name: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDocument(result.user.uid, email, name);
  return result;
}

/** Login */
export async function login(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

/** Logout */
export async function logout() {
  return signOut(auth);
}

/** Get role from Firestore */
export async function getUserRole(): Promise<"admin" | "customer"> {
  const user = auth.currentUser;
  if (!user) return "customer";

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return "customer";

  const data = snap.data() as UserRole;
  return data.role ?? "customer";
}

/** Auth listener */
export function onAuth(callback: (user: any) => void) {
  return onAuthStateChanged(auth, callback);
}
