import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
  Platform,
} from "react-native";

import AdminHeader from "../../../../src/components/admin/AdminHeader";
import CategoryDropdown from "../../../../src/components/admin/CategoryDropdown";
import SubcategoryDropdown from "../../../../src/components/admin/SubcategoryDropdown";
import ColorImageUploader, {
  ColorImageGroup,
} from "../../../../src/components/admin/ColorImageUploader";

import { db } from "../../../../src/services/firebase";
import { uploadImageAsync } from "../../../../src/services/uploadService";

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */
function parseSizes(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function stringifySizes(sizes: string[] = []) {
  return sizes.join(", ");
}

/* --------------------------------------------------
   SCREEN
-------------------------------------------------- */
export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* CORE FIELDS */
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sizesInput, setSizesInput] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  /* MEDIA */
  const [colorGroups, setColorGroups] = useState<ColorImageGroup[]>([]);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);

  /* --------------------------------------------------
     LOAD PRODUCT
  -------------------------------------------------- */
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
      setSizesInput(stringifySizes(data.sizes || []));
      setCategoryId(data.categoryId || "");
      setSubcategoryId(data.subcategoryId || "");
      setExistingVideoUrl(data.video || null);

      /* 🔁 Convert colorImages map → ColorImageGroup[] */
      const groups: ColorImageGroup[] = Object.entries(
        data.colorImages || {}
      ).map(([color, images]: any) => ({
        color,
        images: images ?? [],
      }));

      setColorGroups(groups);
      setLoading(false);
    }

    load();
  }, [id]);

  /* --------------------------------------------------
     VIDEO
  -------------------------------------------------- */
  async function pickVideo() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });

    if (!res.canceled && res.assets.length > 0) {
      setVideoUri(res.assets[0].uri);
    }
  }

  /* --------------------------------------------------
     SAVE
  -------------------------------------------------- */
  async function saveProduct() {
    if (!id) return;

    try {
      setSaving(true);

      const allImages: string[] = [];
      const colorImages: Record<string, string[]> = {};

      /* UPLOAD NEW / KEEP OLD IMAGES */
      for (const group of colorGroups) {
        colorImages[group.color] = [];

        for (let i = 0; i < group.images.length; i++) {
          const uri = group.images[i];

          // already uploaded image
          if (uri.startsWith("https://")) {
            colorImages[group.color].push(uri);
            allImages.push(uri);
          } else {
            const url = await uploadImageAsync(
              uri,
              `products/${id}/${group.color}/${i}.jpg`
            );
            colorImages[group.color].push(url);
            allImages.push(url);
          }
        }
      }

      /* VIDEO */
      let videoUrl = existingVideoUrl;
      if (videoUri) {
        videoUrl = await uploadImageAsync(videoUri, `products/${id}/video.mp4`);
      }

      await updateDoc(doc(db, "products", id), {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        sizes: parseSizes(sizesInput),
        categoryId,
        subcategoryId,
        images: allImages,
        colorImages,
        video: videoUrl ?? null,
        updatedAt: serverTimestamp(),
      });

      alert("Product updated");
      router.back();
    } finally {
      setSaving(false);
    }
  }

  /* --------------------------------------------------
     LOADING
  -------------------------------------------------- */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Edit Product" />

      <ScrollView contentContainerStyle={styles.page}>
        <Card title="Basic Information">
          <Field label="Name">
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </Field>

          <Field label="Description">
            <TextInput
              value={description}
              multiline
              style={[styles.input, styles.textArea]}
              onChangeText={setDescription}
            />
          </Field>

          <View style={styles.row}>
            <Field label="Price ($)">
              <TextInput
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                style={styles.input}
              />
            </Field>

            <Field label="Stock">
              <TextInput
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
                style={styles.input}
              />
            </Field>
          </View>

          <Field label="Sizes (comma separated)">
            <TextInput
              placeholder="S, M, L, XL"
              value={sizesInput}
              onChangeText={setSizesInput}
              style={styles.input}
            />
          </Field>
        </Card>

        <Card title="Category & Subcategory">
          <CategoryDropdown value={categoryId} onChange={setCategoryId} />
          <SubcategoryDropdown
            categoryId={categoryId}
            value={subcategoryId}
            onChange={setSubcategoryId}
          />
        </Card>

        <Card title="Images (per color)">
          <ColorImageUploader
            groups={colorGroups}
            setGroups={setColorGroups}
            maxPerColor={5}
          />
        </Card>

        <Card title="Product Video (optional)">
          <Pressable style={styles.videoBtn} onPress={pickVideo}>
            <Text style={styles.videoText}>
              {videoUri || existingVideoUrl ? "Change Video" : "Add Video"}
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
          {saving ? "Saving..." : "Save Changes"}
        </Text>
      </Pressable>
    </View>
  );
}

/* --------------------------------------------------
   SMALL UI
-------------------------------------------------- */
function Card({ title, children }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Field({ label, children }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      {children}
    </View>
  );
}

/* --------------------------------------------------
   STYLES
-------------------------------------------------- */
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

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

  row: { flexDirection: "row", gap: 12 },

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
