import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useCartStore } from "../../store/cartStore";

export default function ProductQuickViewModal({
  visible,
  product,
  onClose,
  onViewFull,
}: any) {
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [error, setError] = useState("");

  const addToCart = useCartStore((s) => s.addToCart);

  if (!product) return null;

  const sizes = product.sizes ?? ["S", "M", "L", "XL"];
  const colors = product.colors ?? ["Black", "White", "Blue"];
  const images = product.images ?? [];

  const handleAdd = () => {
    if (!size || !color) {
      setError("Please select size & color");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      image: images[0] ?? "",
      price: Number(product.price),
      size,
      color,
      qty: 1,
    });

    setError("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Image
              source={{
                uri:
                  images[0] ?? "https://via.placeholder.com/400?text=No+Image",
              }}
              style={styles.image}
            />

            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>${product.price}</Text>

            {/* SIZE */}
            <Text style={styles.label}>Select Size</Text>
            <View style={styles.row}>
              {sizes.map((s: string) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setSize(s)}
                  style={[styles.opt, size === s && styles.optActive]}
                >
                  <Text
                    style={[styles.optText, size === s && styles.optActiveText]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* COLOR */}
            <Text style={styles.label}>Select Color</Text>
            <View style={styles.row}>
              {colors.map((c: string) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={[styles.opt, color === c && styles.optActive]}
                >
                  <Text
                    style={[
                      styles.optText,
                      color === c && styles.optActiveText,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {error !== "" && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity style={styles.cartBtn} onPress={handleAdd}>
              <Text style={styles.cartTxt}>Add to Cart</Text>
            </TouchableOpacity>

            {/* ✅ Full Description Section */}
            {product.description && (
              <View style={styles.descBox}>
                <Text style={styles.descTitle}>Product Details</Text>
                <Text style={styles.descText}>{product.description}</Text>
              </View>
            )}

            {/* Example: render extra characteristics if present */}
            {product.characteristics &&
              Object.entries(product.characteristics).map(([key, value]) => (
                <Text key={key} style={styles.descText}>
                  • {key}: {String(value)}
                </Text>
              ))}

            <TouchableOpacity style={styles.fullBtn} onPress={onViewFull}>
              <Text>View Full Product</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={{ color: "#777" }}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  box: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    maxHeight: "85%",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    resizeMode: "cover",
  },
  name: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "700",
  },
  price: {
    marginBottom: 10,
    fontSize: 18,
    color: "#e67e22",
  },
  label: {
    marginTop: 14,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  opt: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  optActive: { backgroundColor: "#333" },
  optText: { fontSize: 14 },
  optActiveText: { color: "white", fontWeight: "bold" },
  cartBtn: {
    marginTop: 20,
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 10,
  },
  cartTxt: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  fullBtn: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
  },
  closeBtn: { marginTop: 14, alignItems: "center" },
  error: { color: "red", marginTop: 10 },

  // 🔥 New styles for description/characteristics
  descBox: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  descTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  descText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
    lineHeight: 20,
  },
});
