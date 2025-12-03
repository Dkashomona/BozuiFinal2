import { router } from "expo-router";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, FlatList, Text, View } from "react-native";
import { db } from "../../../src/services/firebase";

export default function CategoryList() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const snap = await getDocs(collection(db, "categories"));
    setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));

    const prodSnap = await getDocs(collection(db, "products"));
    setProducts(prodSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function deleteCategory(id: string) {
    const usedBy = products.filter((p) => p.categoryId === id);

    if (usedBy.length > 0) {
      return alert("❌ Cannot delete: category contains products.");
    }

    await deleteDoc(doc(db, "categories", id));
    alert("Category deleted");
    load();
  }

  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 20 }}
      renderItem={({ item }) => (
        <View
          style={{
            backgroundColor: "#fff",
            padding: 15,
            borderRadius: 10,
            marginBottom: 15,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.name}</Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <Button
              title="Edit"
              onPress={() =>
                router.push({
                  pathname: "/admin/categories/edit/[id]",
                  params: { id: item.id },
                })
              }
            />
            <Button
              color="red"
              title="Delete"
              onPress={() => deleteCategory(item.id)}
            />
          </View>
        </View>
      )}
    />
  );
}
