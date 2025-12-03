/*
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Button,
  Image,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { logout } from "../../../src/services/authService";
import { createProduct } from "../../../src/services/productService";
import { uploadImageAsync } from "../../../src/services/uploadService";
import { pickImage } from "../../../src/utils/pickImage";

export default function AddProductScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  const [variants, setVariants] = useState(""); // "S,M,L"
  const [variantStock, setVariantStock] = useState(""); // "10,15,8"

  async function addImage() {
    const uri = await pickImage();
    if (uri) setImages([...images, uri]);
  }

  async function save() {
    if (!name.trim()) return alert("Product name required");
    if (!price.trim()) return alert("Price required");

    const id = Date.now().toString();
    const uploaded: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const url = await uploadImageAsync(
        images[i],
        `products/${id}/${i}.jpg`
      );
      uploaded.push(url);
    }

    const product = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      currency: "USD",
      categoryId,
      subcategoryId,

      variants: variants.split(",").map((v) => v.trim()),
      variantStock: variantStock.split(",").map((v) => v.trim()),

      rating: 0,
      reviewsCount: 0,
      views: 0,

      colorImages: {},

      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await createProduct(id, product, uploaded);

    alert("Product saved!");
    router.push("/admin/products");
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      {/* LOGOUT *
      <Button
        title="🚪 Sign Out"
        color="red"
        onPress={async () => {
          await logout();
          router.replace("/login");
        }}
      />

      <Text style={{ marginTop: 20 }}>Product Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Classic T-Shirt"
        style={input}
      />

      <Text>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Simple comfortable cotton t-shirt"
        style={[input, { height: 80 }]}
        multiline
      />

      <Text>Price (USD)</Text>
      <TextInput
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        placeholder="19.99"
        style={input}
      />

      <Text>Stock</Text>
      <TextInput
        keyboardType="numeric"
        value={stock}
        onChangeText={setStock}
        placeholder="30"
        style={input}
      />

      <Text>Category ID</Text>
      <TextInput
        value={categoryId}
        onChangeText={setCategoryId}
        placeholder="Fashion ID"
        style={input}
      />

      <Text>Subcategory ID</Text>
      <TextInput
        value={subcategoryId}
        onChangeText={setSubcategoryId}
        placeholder="Men ID"
        style={input}
      />

      <Text>Variants (comma separated)</Text>
      <TextInput
        value={variants}
        onChangeText={setVariants}
        placeholder='S,M,L,XL'
        style={input}
      />

      <Text>Variant Stock</Text>
      <TextInput
        value={variantStock}
        onChangeText={setVariantStock}
        placeholder='12,10,8'
        style={input}
      />

      <Button title="Add Image" onPress={addImage} />

      {images.map((img, i) => (
        <Image
          key={i}
          source={{ uri: img }}
          style={{ width: 120, height: 120, marginTop: 10 }}
        />
      ))}

      <View style={{ marginTop: 20 }}>
        <Button title="💾 Save Product" onPress={save} />
      </View>
    </ScrollView>
  );
}

const input = {
  borderWidth: 1,
  borderColor: "#ccc",
  padding: 10,
  borderRadius: 8,
  marginBottom: 20,
  marginTop: 10,
};
*/
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import {
  Button,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import CategoryDropdown from "../../../src/components/admin/CategoryDropdown";
import ColorImageUploader, {
  ColorImage,
} from "../../../src/components/admin/ColorImageUploader";
import SubcategoryDropdown from "../../../src/components/admin/SubcategoryDropdown";
import { logout } from "../../../src/services/authService";
import { db } from "../../../src/services/firebase";
import { uploadImageAsync } from "../../../src/services/uploadService";

export default function AddProductScreen() {
  const [colorImagesList, setColorImagesList] = useState<ColorImage[]>([]);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  const [sizes, setSizes] = useState(""); // "S,M,L,XL"
  const [colors, setColors] = useState(""); // "white,black"
  const [variantStock, setVariantStock] = useState(""); // "12,10,8"

  const [saving, setSaving] = useState(false);

  async function pickVideo() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: false,
      quality: 0.7,
    });

    if (!res.canceled && res.assets.length > 0) {
      setVideoUri(res.assets[0].uri);
    }
  }

  async function save() {
    try {
      if (!name.trim()) return alert("Product name required");
      if (!price.trim()) return alert("Price required");
      if (!categoryId) return alert("Category required");
      if (!subcategoryId) return alert("Subcategory required");
      if (colorImagesList.length === 0)
        return alert("Add at least one image with a color");

      // Ensure each image has a color
      for (const img of colorImagesList) {
        if (!img.color.trim()) {
          return alert("Every image must have a color");
        }
      }

      setSaving(true);

      const id = Date.now().toString();
      const imageUrls: string[] = [];
      const colorImagesMap: Record<string, string> = {};

      // Upload all images, map color -> image URL
      for (let i = 0; i < colorImagesList.length; i++) {
        const item = colorImagesList[i];
        const url = await uploadImageAsync(
          item.uri,
          `products/${id}/${i}.jpg`
        );
        imageUrls.push(url);
        colorImagesMap[item.color] = url;
      }

      // Upload video if provided
      let videoUrl: string | null = null;
      if (videoUri) {
        videoUrl = await uploadImageAsync(videoUri, `products/${id}/video.mp4`);
      }

      const productData = {
        name,
        description,
        price: parseFloat(price),
        currency: "USD",

        categoryId,
        subcategoryId,

        images: imageUrls,
        colorImages: colorImagesMap,
        video: videoUrl,

        stock: parseInt(stock) || 0,

        variants: {
          sizes: sizes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          colors: colors
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
        },

        variantStock: variantStock
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),

        rating: 0,
        reviewsCount: 0,
        views: 0,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "products"), productData);

      alert("Product saved!");
      router.push("/admin/products");
    } catch (e) {
      console.error(e);
      alert("Error saving product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      {/* Sign Out */}
      <Button
        title="🚪 Sign Out"
        color="red"
        onPress={async () => {
          await logout();
          router.replace("/login");
        }}
      />

      <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 20 }}>
        Add Product
      </Text>

      {/* Basic fields */}
      <Text style={{ marginTop: 20 }}>Product Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Classic T-Shirt"
        style={input}
      />

      <Text>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Simple comfortable cotton t-shirt."
        style={[input, { height: 80 }]}
        multiline
      />

      <Text>Price (USD)</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="19.99"
        keyboardType="decimal-pad"
        style={input}
      />

      <Text>Stock</Text>
      <TextInput
        value={stock}
        onChangeText={setStock}
        placeholder="30"
        keyboardType="number-pad"
        style={input}
      />

      {/* Category & Subcategory */}
      <CategoryDropdown value={categoryId} onChange={setCategoryId} />
      <SubcategoryDropdown
        categoryId={categoryId}
        value={subcategoryId}
        onChange={setSubcategoryId}
      />

      {/* Variants */}
      <Text>Sizes (comma separated)</Text>
      <TextInput
        value={sizes}
        onChangeText={setSizes}
        placeholder="S,M,L,XL"
        style={input}
      />

      <Text>Colors (comma separated)</Text>
      <TextInput
        value={colors}
        onChangeText={setColors}
        placeholder="white,black"
        style={input}
      />

      <Text>Variant Stock (comma separated)</Text>
      <TextInput
        value={variantStock}
        onChangeText={setVariantStock}
        placeholder="12,10,8"
        style={input}
      />

      {/* Color → Image uploader */}
      <ColorImageUploader images={colorImagesList} setImages={setColorImagesList} />

      {/* Video upload */}
      <View style={{ marginTop: 20 }}>
        <Button title="Add Video (optional)" onPress={pickVideo} />
        {videoUri && (
          <Text style={{ marginTop: 8, fontSize: 12 }}>
            Video selected: {videoUri.substring(0, 30)}...
          </Text>
        )}
      </View>

      {/* Save */}
      <View style={{ marginTop: 30 }}>
        <Button
          title={saving ? "Saving..." : "💾 Save Product"}
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

