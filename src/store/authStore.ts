/*

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { auth, db } from "../services/firebase";

export interface AuthState {
  uid: string | null;
  role: "admin" | "customer" | "guest" | null;
  currentUser: any | null;
  loading: boolean;

  init: () => void;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  uid: null,
  role: "guest",
  currentUser: null,
  loading: true,

  /** 🔥 Start Firebase Auth Listener *
  init: () => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // 🟦 User logged out / no user
        set({
          uid: null,
          role: "guest",
          currentUser: null,
          loading: false,
        });
        return;
      }

      // 🟧 Fetch user data from Firestore
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

  /** 🔴 Logout function *
  logout: async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }

    // Reset local state
    set({
      uid: null,
      role: "guest",
      currentUser: null,
    });
  },
}));
*/

import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile as fbUpdateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

// Utility
function getUserDisplayName(user: any) {
  if (!user) return "Guest";
  if (user.displayName) return user.displayName;
  if (user.name) return user.name;
  if (typeof user.email === "string") return user.email.split("@")[0];
  return "Guest";
}

export interface AuthState {
  uid: string | null;
  role: "admin" | "customer" | null;
  currentUser: any | null;
  loading: boolean;

  // Actions
  init: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { name?: string; address?: any }) => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  uid: null,
  role: null,
  currentUser: null,
  loading: true,

  /* ----------------------------------------
     INIT — LISTEN TO FIREBASE AUTH CHANGES
  ---------------------------------------- */
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

      // Ensure DB user exists
      if (!snap.exists()) {
        await setDoc(ref, {
          email: user.email,
          role: "customer",
          createdAt: Date.now(),
        });
      }

      const data = snap.exists() ? snap.data() : {};
      const role = data.role ?? "customer";

      set({
        uid: user.uid,
        role,
        currentUser: {
          uid: user.uid,
          email: user.email,
          role,
          address: data.address || null,
          displayName: getUserDisplayName({ ...user, ...data }),
          ...data,
        },
        loading: false,
      });
    });
  },

  /* ----------------------------------------
     LOGIN
  ---------------------------------------- */
  login: async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  },

  /* ----------------------------------------
     REGISTER
  ---------------------------------------- */
  register: async (email, password, name) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    await fbUpdateProfile(user, { displayName: name });

    await setDoc(doc(db, "users", user.uid), {
      email,
      name,
      role: "customer",
      createdAt: Date.now(),
    });
  },

  /* ----------------------------------------
     LOGOUT
  ---------------------------------------- */
  logout: async () => {
    await signOut(auth);
    set({ currentUser: null, uid: null, role: null });
  },

  /* ----------------------------------------
     PASSWORD RESET
  ---------------------------------------- */
  resetPassword: async (email) => {
    await sendPasswordResetEmail(auth, email);
  },

  /* ----------------------------------------
     UPDATE PROFILE IN FIRESTORE AND AUTH
  ---------------------------------------- */
  updateUserProfile: async (data) => {
    const uid = get().uid;
    if (!uid) return;

    const ref = doc(db, "users", uid);
    await setDoc(ref, data, { merge: true });

    // Update Auth display name
    if (data.name) {
      await fbUpdateProfile(auth.currentUser!, { displayName: data.name });
    }

    // Refresh store
    const snap = await getDoc(ref);
    set({
      currentUser: {
        ...get().currentUser,
        ...snap.data(),
        displayName: getUserDisplayName(snap.data()),
      },
    });
  },
}));
