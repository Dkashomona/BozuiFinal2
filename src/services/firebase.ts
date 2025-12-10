// src/services/firebase.ts
/*
import { initializeApp } from "firebase/app";
import {
  getAuth,
  browserLocalPersistence,
} from "firebase/auth";
import { Platform } from "react-native";

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

export const app = initializeApp(firebaseConfig);

// -------------------------------------------
// AUTH
// -------------------------------------------

// ✔ Web → use browser local persistence
// ✔ Mobile (Expo Go) → use default memory persistence
export const auth = getAuth(app);

if (Platform.OS === "web") {
  auth.setPersistence(browserLocalPersistence);
}

// -------------------------------------------
// Firestore / Storage / Functions
// -------------------------------------------
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");
*/
// src/services/firebase.ts

// src/services/firebase.ts

// src/services/firebase.ts

// src/services/firebase.ts
// src/services/firebase.ts

import { Platform } from "react-native";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

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

// -------------------------------------------
// Initialize Firebase
// -------------------------------------------
export const app = initializeApp(firebaseConfig);

// -------------------------------------------
// AUTH
// -------------------------------------------
export const auth = getAuth(app);

// ✔ Web must manually enable persistence
if (Platform.OS === "web") {
  setPersistence(auth, browserLocalPersistence);
}

// -------------------------------------------
// Firestore / Storage / Functions
// -------------------------------------------
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");
