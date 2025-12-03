import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { auth, db } from "../services/firebase";

export interface AuthState {
  uid: string | null;
  role: "admin" | "customer" | null;
  currentUser: any | null;
  loading: boolean;
  init: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  uid: null,
  role: null,
  currentUser: null,
  loading: true,

  init: () => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        set({
          uid: null,
          role: null,
          currentUser: null,
          loading: false,
        });
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};

      const role = data.role ?? "customer";

      set({
        uid: user.uid,
        role,
        currentUser: {
          uid: user.uid,
          email: user.email,
          role,
          address: data.address ?? null,
          ...data,
        },
        loading: false,
      });
    });
  },
}));
