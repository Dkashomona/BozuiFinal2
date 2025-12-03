import { router } from "expo-router";
import React, { useState } from "react";
import { Button, Image, Text, TextInput, View } from "react-native";
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
    if (!name) return alert("Category name required");
    if (!icon) return alert("Pick an icon");

    const id = Date.now().toString();

    const iconUrl = await uploadImageAsync(icon, `categories/${id}.jpg`);

    await addCategory(id, { name, icon: iconUrl });

    alert("Category saved!");
    router.back();
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Create New Category
      </Text>

      <TextInput
        placeholder="Category Name"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginVertical: 20,
          borderRadius: 8,
        }}
      />

      <Button title="Pick Icon" onPress={pickIcon} />
      {icon && (
        <Image
          source={{ uri: icon }}
          style={{ width: 120, height: 120, marginTop: 20 }}
        />
      )}

      <Button title="Save Category" onPress={save} />
    </View>
  );
}
