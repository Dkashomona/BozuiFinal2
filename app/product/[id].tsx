import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";

import ProductGalleryPremium from "@/src/components/products/ProductGallery";
import ProductSpecs from "@/src/components/products/ProductSpecs";
import ReviewList from "@/src/components/reviews/ReviewList";
import CreateReview from "@/src/components/reviews/CreateReview";
import If from "@/src/components/common/If";

import { db, auth } from "@/src/services/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { useCartStore } from "@/src/store/cartStore";
import type { Review } from "@/src/types/review";

export default function ProductPage() {
  const { id } = useLocalSearchParams();
  const productId = String(id);

  const [product, setProduct] = useState<any>(null);
  const stock = Number(product?.stock ?? 0);
  const inStock = stock > 0;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);

  const addToCart = useCartStore((s) => s.addToCart);

  /* ---------------- LOAD PRODUCT ---------------- */
  const loadProduct = useCallback(async () => {
    if (!productId) return;

    const snap = await getDoc(doc(db, "products", productId));
    if (snap.exists()) {
      setProduct({ id: productId, ...snap.data() });
    }

    setLoading(false);
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  /* ---------------- LOAD REVIEWS ---------------- */
  const loadReviews = useCallback(async () => {
    if (!productId) return;

    const q = query(
      collection(db, "reviews"),
      where("productId", "==", productId)
    );

    const snap = await getDocs(q);

    setReviews(
      snap.docs
        .map((d) => ({ ...(d.data() as Review), id: d.id }))
        .sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
        )
    );
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  /* ---------------- DERIVED ---------------- */
  const colors = useMemo(
    () => Object.keys(product?.colorImages ?? {}),
    [product]
  );

  const sizes = useMemo(() => product?.sizes ?? [], [product]);

  const images = useMemo(() => {
    if (color && product?.colorImages?.[color]) {
      return product.colorImages[color];
    }
    return product?.images ?? [];
  }, [product, color]);

  /* ---------------- CART ---------------- */
  function handleAdd() {
    if (!color || !size) {
      setError("Please select a color and size.");
      return;
    }

    if (!inStock) {
      setError("This product is out of stock.");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      image: images[0] ?? "",
      price: Number(product.price),
      color,
      size,
      qty: 1,
    });

    router.push("/(tabs)/cart");
  }

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found</Text>
      </View>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/");
          }
        }}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ProductGalleryPremium images={images} />

      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>${product.price}</Text>

      <Text style={styles.label}>Select Color</Text>
      <View style={styles.row}>
        {colors.map((c) => (
          <TouchableOpacity
            key={c}
            disabled={!inStock}
            onPress={() => setColor(c)}
            style={[
              styles.colorWrap,
              color === c && styles.colorActive,
              !inStock && styles.colorDisabled,
            ]}
          >
            <Image
              source={{ uri: product.colorImages[c][0] }}
              style={styles.color}
            />

            {!inStock && <Text style={styles.outText}>OUT</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Select Size</Text>

      <View style={styles.row}>
        {sizes.map((s: string) => (
          <TouchableOpacity
            key={s}
            disabled={!inStock}
            onPress={() => setSize(s)}
            style={[
              styles.sizeBtn,
              size === s && styles.sizeActive,
              !inStock && styles.sizeDisabled,
            ]}
          >
            <Text
              style={[styles.sizeText, !inStock && styles.sizeTextDisabled]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <If condition={!!error}>
        <Text style={styles.error}>{error}</Text>
      </If>

      <TouchableOpacity style={styles.cartBtn} onPress={handleAdd}>
        <Text style={styles.cartTxt}>Add to Cart</Text>
      </TouchableOpacity>

      <ProductSpecs product={product} />

      {/* -------- REVIEWS -------- */}
      <Text style={styles.reviewHeader}>Customer Reviews</Text>

      <If condition={!!auth.currentUser}>
        <CreateReview productId={productId} onSubmitted={loadReviews} />
      </If>

      <ReviewList
        productId={productId}
        reviews={reviews}
        reloadReviews={loadReviews}
        user={auth.currentUser ?? null}
      />
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  page: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  name: { fontSize: 26, fontWeight: "700" },
  price: { fontSize: 22, fontWeight: "700" },
  label: { marginTop: 20, fontWeight: "700" },
  row: { flexDirection: "row", gap: 10, marginTop: 8 },
  color: { width: 50, height: 50, borderRadius: 10 },
  cartBtn: { marginTop: 20, backgroundColor: "#111", padding: 16 },
  cartTxt: { color: "#fff", textAlign: "center" },
  error: { color: "red", marginTop: 10 },
  reviewHeader: { marginTop: 30, fontSize: 24, fontWeight: "700" },
  sizePill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },

  sizePillActive: {
    backgroundColor: "#1E90FF", // blue
    borderColor: "#1E90FF",
  },

  sizeTextActive: {
    color: "#fff",
  },

  colorFrame: {
    width: 58,
    height: 58,
    borderRadius: 12,
    padding: 3,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  colorFrameActive: {
    borderColor: "#1E90FF",
  },

  colorFrameDisabled: {
    borderColor: "#ddd",
    backgroundColor: "#f3f4f6",
  },

  colorImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },

  colorImageDisabled: {
    opacity: 0.35,
  },

  outBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#111",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },

  backBtn: {
    marginBottom: 12,
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f1",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  backText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  colorWrap: {
    borderRadius: 12,
    padding: 3,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },

  colorActive: {
    borderColor: "#1E90FF",
  },

  colorDisabled: {
    opacity: 0.4,
  },

  outText: {
    position: "absolute",
    bottom: 2,
    right: 4,
    fontSize: 10,
    fontWeight: "800",
    color: "red",
  },

  sizeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  sizeActive: {
    backgroundColor: "#1E90FF",
    borderColor: "#1E90FF",
  },

  sizeDisabled: {
    opacity: 0.4,
  },

  sizeText: {
    fontWeight: "700",
  },

  sizeTextDisabled: {
    color: "#999",
  },
});
