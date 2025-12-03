import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Product } from "../models/Product";
import { db } from "../services/firebase";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const list: Product[] = [];

        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Product);
        });

        setProducts(list);
      } catch (error) {
        console.log("Error loading products:", error);
      }

      setLoading(false);
    }

    loadProducts();
  }, []);

  return { products, loading };
}
