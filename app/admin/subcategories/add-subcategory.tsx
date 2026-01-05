import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
} from "react-native";

import AdminHeader from "../../../src/components/admin/AdminHeader";
import CategoryDropdown from "../../../src/components/admin/CategoryDropdown";
import { db } from "../../../src/services/firebase";

export default function AddSubcategoryPage() {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return alert("Name required");
    if (!categoryId) return alert("Category required");

    try {
      setSaving(true);

      await addDoc(collection(db, "subcategories"), {
        name,
        categoryId,
        createdAt: serverTimestamp(),
      });

      alert("Subcategory created!");
      router.back();
    } catch (err) {
      console.error(err);
      alert("Failed to create subcategory");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.page}>
      {/* ✅ ADMIN HEADER */}
      <AdminHeader title="Add Subcategory" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Men"
          style={styles.input}
        />

        <CategoryDropdown value={categoryId} onChange={setCategoryId} />

        <View style={{ marginTop: 24 }}>
          <Button
            title={saving ? "Saving..." : "💾 Save"}
            onPress={save}
            disabled={saving}
          />
        </View>
      </ScrollView>
    </View>
  );
}

/* --------------------------------------------------
   STYLES
-------------------------------------------------- */
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    backgroundColor: "#fff",
  },
});
