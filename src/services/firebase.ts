// src/services/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDq-BCWhiqqMyTM5pSM_aZlTImy4rMBWnE",
  authDomain: "bozuishopworld.appspot.com",
  projectId: "bozuishopworld",
  storageBucket: "bozuishopworld.firebasestorage.app",
  messagingSenderId: "536586034208",
  appId: "1:536586034208:web:11cc759ecf5ec4a7063045",
};

// ----------------------------------------------------
// Initialize Firebase — UNIVERSAL (Expo-safe)
// ----------------------------------------------------
export const app = initializeApp(firebaseConfig);

// Standard auth (works on web + Expo Go)
export const auth = getAuth(app);

// Firestore
export const db = getFirestore(app);

// Storage
export const storage = getStorage(app);

// Cloud Functions
export const functions = getFunctions(app, "us-central1");
