import { router } from "expo-router";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, FlatList, Image, Text, View } from "react-native";
import { db } from "../../../src/services/firebase";

export default function ProductList() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const snap = await getDocs(collection(db, "products"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProducts(list);
  }

  async function removeProduct(id: string) {
    await deleteDoc(doc(db, "products", id));
    alert("Product deleted");
    loadProducts();
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 20 }}
      renderItem={({ item }) => (
        <View
          style={{
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 10,
            marginBottom: 15,
            flexDirection: "row",
            gap: 10,
          }}
        >
          <Image
            source={{ uri: item.images?.[0] }}
            style={{ width: 80, height: 80, borderRadius: 10 }}
          />

          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              {item.name}
            </Text>
            <Text>${item.price}</Text>
            <Text>Stock: {item.stock}</Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <Button
                title="Edit"
                onPress={() =>
                  router.push({pathname: "/admin/products/edit/[id]", params: { id: item.id },})
                  
                 
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
  );
}
