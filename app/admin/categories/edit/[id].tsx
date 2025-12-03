import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { Button, ScrollView, Text, TextInput } from "react-native";
import { db } from "../../../../src/services/firebase";

export default function EditCategoryPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  // FIX: wrap load() in useCallback so ESLint is happy
  const load = useCallback(async () => {
    if (!id) return;
    const ref = doc(db, "categories", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return router.back();

    setName(snap.data().name);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]); // FIX: load added as dependency safely

  async function save() {
    await updateDoc(doc(db, "categories", id), {
      name,
      updatedAt: new Date(),
    });

    alert("Category updated!");
    router.back();
  }

  if (loading) return <Text>Loading…</Text>;

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Edit Category</Text>

      <Text style={{ marginTop: 20 }}>Category Name</Text>
      <TextInput value={name} onChangeText={setName} style={input} />

      <Button title="Save" onPress={save} />
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
