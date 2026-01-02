import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../services/firebase";

/* ----------------------------------------------------------
   Upload review image → Firebase Storage
---------------------------------------------------------- */

export async function uploadReviewImage(uri: string, userId: string): Promise<string> {
  try {
    // Convert local URI to Blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create a unique filename
    const path = `reviews/${userId}/${Date.now()}-${Math.random()}.jpg`;
    const storageRef = ref(storage, path);

    // Upload to Firebase
    await uploadBytes(storageRef, blob);

    // Get public URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;

  } catch (err) {
    console.error("Firebase upload error:", err);
    throw err;
  }
}
