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
  authDomain: "bozuishopworld.firebaseapp.com",
  projectId: "bozuishopworld",
  storageBucket: "bozuishopworld.firebasestorage.app",
  messagingSenderId: "536586034208",
  appId: "1:536586034208:web:11cc759ecf5ec4a7063045",
};

export const app = initializeApp(firebaseConfig);

// AUTH
export const auth = getAuth(app);
export const authReady =
  Platform.OS === "web"
    ? setPersistence(auth, browserLocalPersistence)
    : Promise.resolve();

// SERVICES
export const db = getFirestore(app);
export const storage = getStorage(
  app,
  "gs://bozuishopworld.firebasestorage.app"
);
export const functions = getFunctions(app, "us-central1");
