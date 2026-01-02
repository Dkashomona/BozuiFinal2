/*

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from "react-native";

export type ProductCardProps = {
  product: {
    id: string;
    name: string;
    price?: number;
    images?: string[];
  };
  width: number;
  wishlist: boolean;
  onToggleWishlist: () => void;
  onOpen: () => void;
};

export default function ProductCard({
  product,
  width,
  wishlist,
  onToggleWishlist,
  onOpen,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  const imageUrl =
    product.images?.[0] ??
    "https://via.placeholder.com/400x400.png?text=No+Image";

  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      activeOpacity={0.9}
      onPress={onOpen}
      {...(Platform.OS === "web"
        ? {
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => setHovered(false),
          }
        : {})}
    >
      {/* Wishlist Heart *
      <TouchableOpacity
        style={styles.heart}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={(e) => {
          e.stopPropagation(); // prevent opening product
          onToggleWishlist();
        }}
      >
        <Text style={{ fontSize: 18 }}>{wishlist ? "❤️" : "🤍"}</Text>
      </TouchableOpacity>

      {/* Product Image *
      <View style={styles.imgWrap}>
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.img,
            hovered && Platform.OS === "web" ? styles.imgHover : null,
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Product Name *
      <Text numberOfLines={2} style={styles.name}>
        {product.name}
      </Text>

      {/* Price *
      <Text style={styles.price}>${product.price}</Text>

      {/* Web Hover Overlay *
      {Platform.OS === "web" && hovered && (
        <View style={styles.hoverOverlay}>
          <Text style={styles.hoverText}>View Product</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 16,

    // Premium shadow
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,

    position: "relative",
    overflow: "hidden",
  },

  heart: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 6,
    borderRadius: 20,
  },

  imgWrap: {
    width: "100%",
    aspectRatio: 1, // ✅ square product images (Amazon default)
    backgroundColor: "#f6f6f6",
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  img: {
    width: "100%",
    height: "100%",
    transform: [{ scale: 1 }],
  },

  imgHover: {
    transform: [{ scale: 1.03 }],
  },

  name: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    minHeight: 40,
  },

  price: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },

  hoverOverlay: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    paddingVertical: 6,
    alignItems: "center",
  },

  hoverText: {
    backgroundColor: "#000",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    opacity: 0.85,
  },
});
*/
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";

export type ProductCardProps = {
  product: {
    id: string;
    name: string;
    price?: number;
    images?: string[];
  };
  width?: number; // ✅ optional by design
  wishlist: boolean;
  onToggleWishlist: () => void;
  onOpen: () => void;
};

export default function ProductCard({
  product,
  width,
  wishlist,
  onToggleWishlist,
  onOpen,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  const imageUrl =
    product.images?.[0] ??
    "https://via.placeholder.com/400x400.png?text=No+Image";

  /* ----------------------------------------------------
     CARD STYLE (PLATFORM SAFE)
  ---------------------------------------------------- */
  const cardStyle: StyleProp<ViewStyle> =
    Platform.OS === "web" ? styles.cardWeb : [styles.cardNative, { width }];

  return (
    <TouchableOpacity
      style={cardStyle}
      activeOpacity={0.9}
      onPress={onOpen}
      {...(Platform.OS === "web"
        ? {
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => setHovered(false),
          }
        : {})}
    >
      {/* ❤️ Wishlist */}
      <TouchableOpacity
        style={styles.heart}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={(e) => {
          e.stopPropagation();
          onToggleWishlist();
        }}
      >
        <Text style={{ fontSize: 18 }}>{wishlist ? "❤️" : "🤍"}</Text>
      </TouchableOpacity>

      {/* 🖼 Image */}
      <View style={styles.imgWrap}>
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.img,
            hovered && Platform.OS === "web" ? styles.imgHover : null,
          ]}
          resizeMode="contain"
        />
      </View>

      {/* 📦 Name */}
      <Text numberOfLines={2} style={styles.name}>
        {product.name}
      </Text>

      {/* 💰 Price */}
      <Text style={styles.price}>${product.price?.toFixed(2)}</Text>

      {/* 🖥 Hover CTA */}
      {Platform.OS === "web" && hovered && (
        <View style={styles.hoverOverlay}>
          <Text style={styles.hoverText}>View Product</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ----------------------------------------------------
   STYLES
---------------------------------------------------- */
const styles = StyleSheet.create({
  /* ---------- WEB ---------- */
  cardWeb: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 16,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  /* ---------- NATIVE ---------- */
  cardNative: {
    margin: 8,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 16,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },

  heart: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 6,
    borderRadius: 20,
  },

  imgWrap: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f6f6f6",
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  img: {
    width: "100%",
    height: "100%",
    transform: [{ scale: 1 }],
  },

  imgHover: {
    transform: [{ scale: 1.03 }],
  },

  name: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    minHeight: 40,
  },

  price: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },

  hoverOverlay: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  hoverText: {
    backgroundColor: "#000",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    opacity: 0.85,
  },
});
