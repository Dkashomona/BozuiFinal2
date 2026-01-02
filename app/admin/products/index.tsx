import { router } from "expo-router";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, FlatList, Image, Text, View, StyleSheet } from "react-native";

import AdminHeader from "../../../src/components/admin/AdminHeader";
import { db } from "../../../src/services/firebase";

export default function ProductList() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const snap = await getDocs(collection(db, "products"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProducts(list);
    setLoading(false);
  }

  async function removeProduct(id: string) {
    const ok = confirm("Delete this product?");
    if (!ok) return;

    await deleteDoc(doc(db, "products", id));
    alert("Product deleted");
    loadProducts();
  }

  return (
    <View style={{ flex: 1 }}>
      {/* ✅ ADMIN HEADER */}
      <AdminHeader title="Products" />

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadProducts}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.images?.[0] }} style={styles.image} />

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>${item.price}</Text>
              <Text style={styles.stock}>Stock: {item.stock}</Text>

              <View style={styles.actions}>
                <Button
                  title="Edit"
                  onPress={() =>
                    router.push({
                      pathname: "/admin/products/edit/[id]",
                      params: { id: item.id },
                    })
                  }
                />
                <Button
                  title="Delete"
                  color="red"
                  onPress={() => removeProduct(item.id)}
                />
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

/* --------------------------------------------------
   STYLES
-------------------------------------------------- */
const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#f4f6f8",
  },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    gap: 12,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },

  name: {
    fontWeight: "800",
    fontSize: 16,
  },

  price: {
    marginTop: 2,
    fontWeight: "700",
    color: "#e67e22",
  },

  stock: {
    marginTop: 2,
    fontSize: 13,
    color: "#555",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
});
