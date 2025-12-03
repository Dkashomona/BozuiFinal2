import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator, // 🔥 import spinner
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/services/firebase";
import { useCartStore } from "../../src/store/cartStore";

export default function ProductPage() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [error, setError] = useState("");

  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      const snap = await getDoc(doc(db, "products", String(id)));
      if (snap.exists()) {
        setProduct({ id, ...snap.data() });
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  const handleAdd = () => {
    if (!size || !color) {
      setError("Please select size & color.");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      image: product.images?.[0] ?? "",
      price: Number(product.price),
      size,
      color,
      qty: 1,
    });

    router.push("/(tabs)/cart");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e67e22" /> 
        <Text style={{ marginTop: 10 }}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  const sizes = product.sizes ?? ["S", "M", "L", "XL"];
  const colors = product.colors ?? ["Black", "White", "Blue"];
  const images = product.images ?? [];

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 16 }}>
      <Image
        source={{ uri: images[0] ?? "https://via.placeholder.com/400?text=No+Image" }}
        style={styles.image}
      />

      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>${product.price}</Text>

      <Text style={styles.label}>Select Size</Text>
      <View style={styles.row}>
        {sizes.map((s: string) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSize(s)}
            style={[styles.opt, size === s && styles.optActive]}
          >
            <Text style={[styles.optText, size === s && styles.optActiveText]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Select Color</Text>
      <View style={styles.row}>
        {colors.map((c: string) => (
          <TouchableOpacity
            key={c}
            onPress={() => setColor(c)}
            style={[styles.opt, color === c && styles.optActive]}
          >
            <Text style={[styles.optText, color === c && styles.optActiveText]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.cartBtn} onPress={handleAdd}>
        <Text style={styles.cartTxt}>Add to Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={{ color: "#666" }}>⬅ Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#f5f5f5" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    backgroundColor: "#ddd",
  },
  name: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: "700",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e67e22",
    marginBottom: 16,
  },
  label: {
    marginTop: 16,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  opt: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  optActive: {
    backgroundColor: "#222",
  },
  optText: {
    fontSize: 14,
  },
  optActiveText: {
    color: "white",
    fontWeight: "bold",
  },
  cartBtn: {
    marginTop: 20,
    backgroundColor: "#222",
    padding: 14,
    borderRadius: 10,
  },
  cartTxt: {
    color: "white",
    textAlign: "center",
    fontWeight: "700",
  },
  closeBtn: { marginTop: 18, alignItems: "center" },
  error: { color: "red", marginTop: 10 },
});