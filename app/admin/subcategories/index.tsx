import { router } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { db } from "../../../src/services/firebase";

export default function SubcategoryListPage() {
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Load categories first → map id → name
    const catSnap = await getDocs(collection(db, "categories"));
    const catMap: Record<string, string> = {};
    catSnap.forEach((d) => (catMap[d.id] = d.data().name));
    setCategories(catMap);

    // Load subcategories
    const subSnap = await getDocs(collection(db, "subcategories"));
    const subList = subSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setSubcategories(subList);
  }

  async function deleteSubcategory(id: string) {
    // BLOCK deletion if products use this subcategory
    const prodSnap = await getDocs(
      query(collection(db, "products"), where("subcategoryId", "==", id))
    );

    if (!prodSnap.empty) {
      return Alert.alert(
        "Cannot Delete",
        "This subcategory is linked to existing products."
      );
    }

    await deleteDoc(doc(db, "subcategories", id));
    alert("Deleted");
    loadData();
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={styles.title}>Subcategories</Text>

      <Button
        title="➕ Add Subcategory"
        onPress={() => router.push("/admin/subcategories/add-subcategory")}
      />

      <FlatList
        data={subcategories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.parentCategory}>
                Category: {categories[item.categoryId] || "Unknown"}
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button
                title="Edit"
                onPress={() =>
                  router.push({
                    pathname: "/admin/subcategories/edit/[id]",
                    params: { id: item.id },
                  })
                }
              />

              <Button
                title="Delete"
                color="red"
                onPress={() => deleteSubcategory(item.id)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  parentCategory: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
