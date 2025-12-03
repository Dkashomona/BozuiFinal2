import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Final Category Interface
export interface Category {
  id: string;
  name: string;
  icon?: string | null;
  createdAt: number;
}

// Reference to "categories" collection
const categoriesRef = collection(db, "categories");

/**
 * Create category
 */
export async function addCategory(
  id: string,
  data: { name: string; icon?: string | null }
) {
  const payload: Category = {
    id,
    name: data.name,
    icon: data.icon ?? null,
    createdAt: Date.now(),
  };

  await setDoc(doc(categoriesRef, id), payload);
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  const snapshot = await getDocs(categoriesRef);
  const list: Category[] = [];

  snapshot.forEach((docSnap) => {
    list.push(docSnap.data() as Category);
  });

  return list;
}

/**
 * Update category
 */
export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id" | "createdAt">>
) {
  const ref = doc(categoriesRef, id);
  await updateDoc(ref, data);
}

/**
 * Delete category
 */
export async function deleteCategory(id: string) {
  const ref = doc(categoriesRef, id);
  await deleteDoc(ref);
}
