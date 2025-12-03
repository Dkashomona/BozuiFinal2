import { router, useLocalSearchParams } from "expo-router";
import {
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import CategoryDropdown from "../../../../src/components/admin/CategoryDropdown";
import SubcategoryDropdown from "../../../../src/components/admin/SubcategoryDropdown";
import { db } from "../../../../src/services/firebase";

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  useEffect(() => {
    if (!id) return;

    async function load() {
      const ref = doc(db, "products", id);

      const snap = await getDoc(ref);
      if (!snap.exists()) {
        alert("Product not found");
        router.back();
        return;
      }

      const data: any = snap.data();

      setName(data.name || "");
      setDescription(data.description || "");
      setPrice(String(data.price ?? ""));
      setStock(String(data.stock ?? ""));
      setCategoryId(data.categoryId || "");
      setSubcategoryId(data.subcategoryId || "");
      setLoading(false);
    }

    load();
  }, [id]); // 👈 only dependency

  async function save() {
    if (!id) return;

    setSaving(true);
    const ref = doc(db, "products", id);

    await updateDoc(ref, {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      categoryId,
      subcategoryId,
      updatedAt: new Date(),
    });

    setSaving(false);
    alert("Product updated");
    router.back();
  }

  if (loading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Edit Product</Text>

      <Text style={{ marginTop: 20 }}>Name</Text>
      <TextInput value={name} onChangeText={setName} style={input} />

      <Text>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={[input, { height: 80 }]}
        multiline
      />

      <Text>Price</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        style={input}
      />

      <Text>Stock</Text>
      <TextInput
        value={stock}
        onChangeText={setStock}
        keyboardType="number-pad"
        style={input}
      />

      <CategoryDropdown value={categoryId} onChange={setCategoryId} />
      <SubcategoryDropdown
        categoryId={categoryId}
        value={subcategoryId}
        onChange={setSubcategoryId}
      />

      <View style={{ marginTop: 20 }}>
        <Button
          title={saving ? "Saving..." : "💾 Save Changes"}
          onPress={save}
          disabled={saving}
        />
      </View>
    </ScrollView>
  );
}

const input = {
  borderWidth: 1,
  borderColor: "#ccc",
  padding: 10,
  borderRadius: 8,
  marginBottom: 16,
  marginTop: 6,
};
