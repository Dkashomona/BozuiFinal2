import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
  Platform,
} from "react-native";

import AdminHeader from "../../../src/components/admin/AdminHeader";
import CategoryDropdown from "../../../src/components/admin/CategoryDropdown";
import SubcategoryDropdown from "../../../src/components/admin/SubcategoryDropdown";
import ColorImageUploader from "../../../src/components/admin/ColorImageUploader";
import { db } from "../../../src/services/firebase";
import { uploadImageAsync } from "../../../src/services/uploadService";

/* --------------------------------------------------
   TYPES
-------------------------------------------------- */
type ColorImageGroup = {
  color: string;
  images: string[];
};

type Errors = {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  sizes?: string;
  categoryId?: string;
  subcategoryId?: string;
  images?: string;
};

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */
function generateSKU(name: string, categoryId: string) {
  const base = `${categoryId || "GEN"}-${name || "ITEM"}`
    .replace(/\s+/g, "-")
    .toUpperCase();
  return `${base}-${Date.now().toString().slice(-6)}`;
}

function parseSizes(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/* --------------------------------------------------
   SCREEN
-------------------------------------------------- */
export default function AddProductScreen() {
  /* ---------------- STATE ---------------- */
  const [colorGroups, setColorGroups] = useState<ColorImageGroup[]>([]);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sizesInput, setSizesInput] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [sku, setSku] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  /* ---------------- SKU AUTO ---------------- */
  useEffect(() => {
    if (!sku && (name || categoryId)) {
      setSku(generateSKU(name, categoryId));
    }
  }, [name, categoryId, sku]);

  /* ---------------- VALIDATION ---------------- */
  function validate(): boolean {
    const e: Errors = {};

    if (!name.trim()) e.name = "Product name required";
    if (!description.trim()) e.description = "Description required";
    if (!price || isNaN(Number(price))) e.price = "Valid price required";
    if (!stock || isNaN(Number(stock))) e.stock = "Valid stock required";

    const sizes = parseSizes(sizesInput);
    if (sizes.length === 0) e.sizes = "At least one size required";

    if (!categoryId) e.categoryId = "Select a category";
    if (!subcategoryId) e.subcategoryId = "Select a subcategory";

    const imageCount = colorGroups.reduce((sum, g) => sum + g.images.length, 0);
    if (imageCount === 0) e.images = "At least one image required";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function clearError(field: keyof Errors) {
    setErrors((p) => ({ ...p, [field]: undefined }));
  }

  /* ---------------- VIDEO ---------------- */
  async function pickVideo() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });

    if (!res.canceled && res.assets.length > 0) {
      setVideoUri(res.assets[0].uri);
    }
  }

  /* ---------------- SAVE ---------------- */
  async function saveProduct() {
    if (!validate()) return;

    try {
      setSaving(true);

      const productId = Date.now().toString();
      const allImages: string[] = [];
      const colorImages: Record<string, string[]> = {};

      for (const group of colorGroups) {
        colorImages[group.color] = [];

        for (let i = 0; i < group.images.length; i++) {
          const uri = group.images[i];
          const url = await uploadImageAsync(
            uri,
            `products/${productId}/${group.color}/${i}.jpg`
          );
          allImages.push(url);
          colorImages[group.color].push(url);
        }
      }

      let videoUrl: string | null = null;
      if (videoUri) {
        videoUrl = await uploadImageAsync(
          videoUri,
          `products/${productId}/video.mp4`
        );
      }

      await addDoc(collection(db, "products"), {
        name,
        description,
        sku,
        status,
        price: Number(price),
        stock: Number(stock),
        sizes: parseSizes(sizesInput),
        categoryId,
        subcategoryId,
        images: allImages,
        colorImages,
        video: videoUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert("Product saved");
      router.push("/admin/products");
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Add Product" />

      <ScrollView contentContainerStyle={styles.page}>
        {/* STATUS + SKU */}
        <View style={styles.row}>
          <Pressable
            style={[
              styles.statusPill,
              status === "published" && styles.statusActive,
            ]}
            onPress={() =>
              setStatus(status === "draft" ? "published" : "draft")
            }
          >
            <Text style={styles.statusText}>
              {status === "draft" ? "Draft" : "Published"}
            </Text>
          </Pressable>

          <Field label="SKU">
            <TextInput value={sku} onChangeText={setSku} style={styles.input} />
          </Field>
        </View>

        <Card title="Basic Information">
          <Field label="Name" error={errors.name}>
            <TextInput
              value={name}
              onChangeText={(v) => {
                setName(v);
                clearError("name");
              }}
              style={[styles.input, errors.name && styles.inputError]}
            />
          </Field>

          <Field label="Description" error={errors.description}>
            <TextInput
              value={description}
              multiline
              style={[
                styles.input,
                styles.textArea,
                errors.description && styles.inputError,
              ]}
              onChangeText={(v) => {
                setDescription(v);
                clearError("description");
              }}
            />
          </Field>

          <View style={styles.row}>
            <Field label="Price ($)" error={errors.price}>
              <TextInput
                keyboardType="numeric"
                value={price}
                onChangeText={(v) => {
                  setPrice(v);
                  clearError("price");
                }}
                style={[styles.input, errors.price && styles.inputError]}
              />
            </Field>

            <Field label="Stock" error={errors.stock}>
              <TextInput
                keyboardType="numeric"
                value={stock}
                onChangeText={(v) => {
                  setStock(v);
                  clearError("stock");
                }}
                style={[styles.input, errors.stock && styles.inputError]}
              />
            </Field>
          </View>

          <Field label="Sizes (comma separated)" error={errors.sizes}>
            <TextInput
              placeholder="S, M, L, XL"
              value={sizesInput}
              onChangeText={(v) => {
                setSizesInput(v);
                clearError("sizes");
              }}
              style={[styles.input, errors.sizes && styles.inputError]}
            />
          </Field>
        </Card>

        <Card title="Category & Subcategory">
          <Field error={errors.categoryId}>
            <CategoryDropdown
              value={categoryId}
              onChange={(v) => {
                setCategoryId(v);
                clearError("categoryId");
              }}
            />
          </Field>

          <Field error={errors.subcategoryId}>
            <SubcategoryDropdown
              categoryId={categoryId}
              value={subcategoryId}
              onChange={(v) => {
                setSubcategoryId(v);
                clearError("subcategoryId");
              }}
            />
          </Field>
        </Card>

        <Card title="Images (up to 5 per color)" error={errors.images}>
          <ColorImageUploader
            groups={colorGroups}
            setGroups={setColorGroups}
            maxPerColor={5}
          />
        </Card>

        <Card title="Product Video (optional)">
          <Pressable style={styles.videoBtn} onPress={pickVideo}>
            <Text style={styles.videoText}>
              {videoUri ? "Change Video" : "Add Product Video"}
            </Text>
          </Pressable>
        </Card>
      </ScrollView>

      <Pressable
        style={styles.saveButton}
        onPress={saveProduct}
        disabled={saving}
      >
        <Text style={styles.saveText}>
          {saving ? "Saving..." : "Save Product"}
        </Text>
      </Pressable>
    </View>
  );
}

/* --------------------------------------------------
   UI HELPERS
-------------------------------------------------- */
function Card({
  title,
  children,
  error,
}: {
  title: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label?: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <View style={{ flex: 1 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      {children}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

/* --------------------------------------------------
   STYLES
-------------------------------------------------- */
const styles = StyleSheet.create({
  page: {
    padding: 16,
    paddingBottom: 140,
    backgroundColor: Platform.OS === "web" ? "#eef1f4" : "#f4f6f8",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    ...(Platform.OS === "web" && {
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    }),
  },
  cardTitle: { fontSize: 16, fontWeight: "900", marginBottom: 12 },
  label: { fontWeight: "700", marginBottom: 6 },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 12,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  inputError: { borderColor: "#ef4444" },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "600",
  },
  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statusPill: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
  },
  statusActive: { backgroundColor: "#16a34a" },
  statusText: { color: "white", fontWeight: "900" },
  videoBtn: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  videoText: { color: "white", fontWeight: "900" },
  saveButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#e67e22",
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
  },
  saveText: { color: "white", fontSize: 16, fontWeight: "900" },
});
