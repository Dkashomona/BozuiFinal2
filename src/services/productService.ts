import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { Product } from "../models/Product";
import { db } from "./firebase";

export async function createProduct(productId: string, data: any, imageUrls: string[]) {
  await setDoc(doc(db, "products", productId), {
    ...data,
    images: imageUrls,
    createdAt: new Date(),
  });
}

export async function getAllProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
}
