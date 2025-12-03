import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadImageAsync(uri: string, path: string) {
  // Create a reference in Firebase Storage
  const fileRef = ref(storage, path);

  // Read the file into a blob
  const response = await fetch(uri);
  const blob = await response.blob();

  // Upload to Firebase Storage
  await uploadBytes(fileRef, blob);

  // Get the public download URL
  return await getDownloadURL(fileRef);
}