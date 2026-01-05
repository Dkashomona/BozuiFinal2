import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Button,
  StyleSheet,
  Platform,
} from "react-native";

import AdminHeader from "../../../src/components/admin/AdminHeader";
import { addCategory } from "../../../src/services/categoryService";
import { uploadImageAsync } from "../../../src/services/uploadService";
import { pickImage } from "../../../src/utils/pickImage";

export default function AddCategoryScreen() {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string | null>(null);

  async function pickIcon() {
    const uri = await pickImage();
    if (uri) setIcon(uri);
  }

  async function save() {
    if (!name.trim()) return alert("Category name required");
    if (!icon) return alert("Pick an icon");

    const id = Date.now().toString();

    const iconUrl = await uploadImageAsync(icon, `categories/${id}.jpg`);

    await addCategory(id, { name, icon: iconUrl });

    alert("Category saved!");
    router.back();
  }

  return (
    <View style={styles.page}>
      {/* ✅ ADMIN HEADER */}
      <AdminHeader title="Create Category" />

      <View style={styles.content}>
        <Text style={styles.title}>Create New Category</Text>

        <TextInput
          placeholder="Category Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <Button title="Pick Icon" onPress={pickIcon} />

        {icon && (
          <Image
            source={{ uri: icon }}
            style={styles.preview}
            resizeMode="contain"
          />
        )}

        <View style={{ marginTop: 20 }}>
          <Button title="Save Category" onPress={save} />
        </View>
      </View>
    </View>
  );
}

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
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  preview: {
    width: 120,
    height: 120,
    marginTop: 20,
    borderRadius: 12,
    alignSelf: "center",
  },
});
