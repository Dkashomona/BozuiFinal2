
/*

import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

export default function ProductQuickViewModal({
  visible,
  product,
  onClose,
  onViewFull,
}: {
  visible: boolean;
  product: any | null;
  onClose: () => void;
  onViewFull: () => void;
}) {
  // ❗Hooks MUST be called BEFORE any return
  const [imgIndex, setImgIndex] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [error, setError] = useState("");

  // If product not loaded -> show nothing
  if (!product) return null;

  const images = product.images ?? [];
  const sizes = product.sizes ?? ["S", "M", "L", "XL"];
  const colors = product.colors ?? ["Black", "White", "Blue"];

  const handleAddToCart = () => {
    if (!size || !color) {
      setError("Please select size & color before adding to cart.");
      return;
    }

    setError("");

    console.log("ADD TO CART:", {
      id: product.id,
      size,
      color,
    });

    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />

      <View style={styles.container}>
        {/* Images *
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / width
            );
            setImgIndex(index);
          }}
        >
          {images.map((img: string, i: number) => (
            <Image
              key={i}
              source={{ uri: img }}
              style={styles.image}
            />
          ))}
        </ScrollView>

        {/* Dots *
        <View style={styles.dots}>
          {images.map((_: any, i: React.Key | null | undefined) => (
            <View
              key={i}
              style={[
                styles.dot,
                { opacity: i === imgIndex ? 1 : 0.3 },
              ]}
            />
          ))}
        </View>

        {/* Info *
        <Text style={styles.name}>{product.name}</Text>
        {product.price !== undefined && (
          <Text style={styles.price}>${product.price}</Text>
        )}

        {/* SIZE *
        <Text style={styles.label}>Select Size *</Text>
        <View style={styles.optionsRow}>
          {sizes.map((s: string) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSize(s)}
              style={[
                styles.option,
                size === s && styles.optionSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  size === s && styles.optionTextSelected,
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* COLOR *
        <Text style={styles.label}>Select Color *</Text>
        <View style={styles.optionsRow}>
          {colors.map((c: string) => (
            <TouchableOpacity
              key={c}
              onPress={() => setColor(c)}
              style={[
                styles.option,
                color === c && styles.optionSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  color === c && styles.optionTextSelected,
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error !== "" && <Text style={styles.error}>{error}</Text>}

        {/* Buttons *
        <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
          <Text style={styles.cartText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.fullBtn} onPress={onViewFull}>
          <Text style={styles.fullText}>View Full Product</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  container: {
    position: "absolute",
    left: "6%",
    right: "6%",
    top: "10%",
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
  },
  image: {
    width: width * 0.8,
    height: 280,
    alignSelf: "center",
    borderRadius: 12,
  },
  dots: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#333",
    marginHorizontal: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  price: {
    fontSize: 16,
    color: "#e67e22",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 14,
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 6,
  },
  option: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: "#3498db",
  },
  optionText: {
    fontSize: 14,
  },
  optionTextSelected: {
    color: "white",
    fontWeight: "bold",
  },
  error: {
    marginTop: 10,
    color: "red",
  },
  cartBtn: {
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  cartText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  fullBtn: {
    borderColor: "#222",
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  fullText: {
    textAlign: "center",
    fontWeight: "600",
  },
  closeBtn: {
    padding: 10,
  },
  closeText: {
    textAlign: "center",
    color: "#666",
    fontWeight: "bold",
  },
});

*/

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
                uri: images[0] ?? "https://via.placeholder.com/400?text=No+Image",
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
                    style={[
                      styles.optText,
                      size === s && styles.optActiveText,
                    ]}
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