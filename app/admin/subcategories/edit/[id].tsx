import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, ScrollView, Text, TextInput, View } from "react-native";
import CategoryDropdown from "../../../../src/components/admin/CategoryDropdown";
import { db } from "../../../../src/services/firebase";

export default function EditSubcategoryPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const ref = doc(db, "subcategories", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        alert("Subcategory not found");
        router.back();
        return;
      }

      const data: any = snap.data();
      setName(data.name || "");
      setCategoryId(data.categoryId || "");
      setLoading(false);
    }

    load();
  }, [id]);

  async function save() {
    if (!id) return;
    if (!name.trim()) return alert("Name required");
    if (!categoryId) return alert("Category required");

    setSaving(true);
    await updateDoc(doc(db, "subcategories", id), {
      name,
      categoryId,
      updatedAt: new Date(),
    });

    setSaving(false);
    alert("Subcategory updated!");
    router.back();
  }

  if (loading) return <Text>Loading…</Text>;

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Edit Subcategory
      </Text>

      <Text style={{ marginTop: 20 }}>Name</Text>
      <TextInput value={name} onChangeText={setName} style={input} />

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
