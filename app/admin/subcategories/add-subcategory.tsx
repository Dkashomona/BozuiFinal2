import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { Button, ScrollView, Text, TextInput, View } from "react-native";
import CategoryDropdown from "../../../src/components/admin/CategoryDropdown";
import { db } from "../../../src/services/firebase";

export default function AddSubcategoryPage() {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return alert("Name required");
    if (!categoryId) return alert("Category required");

    setSaving(true);

    await addDoc(collection(db, "subcategories"), {
      name,
      categoryId,
      createdAt: serverTimestamp(),
    });

    setSaving(false);
    alert("Subcategory created!");
    router.back();
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Add Subcategory</Text>

      <Text style={{ marginTop: 20 }}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Men"
        style={input}
      />

      <CategoryDropdown value={categoryId} onChange={setCategoryId} />

      <View style={{ marginTop: 20 }}>
        <Button
          title={saving ? "Saving..." : "💾 Save"}
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
  marginVertical: 10,
};
