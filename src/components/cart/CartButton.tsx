import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useCartStore } from "../../store/cartStore";

type Props = {
  product: any;
  showPriceDetails?: boolean; // 🔥 optional prop
};

export default function CartButton({ product, showPriceDetails = false }: Props) {
  const cartItems = useCartStore((s) => s.items);
  const addToCart = useCartStore((s) => s.addToCart);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  const itemInCart = cartItems.find((ci) => ci.id === product.id);

  if (itemInCart) {
    return (
      <View style={styles.qtyRow}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => {
            if (itemInCart.qty > 1) {
              updateQty(product.id, itemInCart.qty - 1);
            } else {
              removeFromCart(product.id);
            }
          }}
        >
          <Text style={styles.qtyTxt}>-</Text>
        </TouchableOpacity>

        <Text style={styles.qtyCount}>{itemInCart.qty}</Text>

        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => updateQty(product.id, itemInCart.qty + 1)}
        >
          <Text style={styles.qtyTxt}>+</Text>
        </TouchableOpacity>

        {/* 🔥 Optional price details */}
        {showPriceDetails && (
          <Text style={styles.priceDetails}>
            ${itemInCart.price} × {itemInCart.qty} = ${itemInCart.price * itemInCart.qty}
          </Text>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.addBtn}
      onPress={() =>
        addToCart({
          id: product.id,
          name: product.name,
          image: product.images?.[0] ?? "",
          price: Number(product.price),
          size: product.sizes?.[0] ?? "",
          color: product.colors?.[0] ?? "",
          qty: 1,
        })
      }
    >
      <Text style={styles.addBtnText}>Add to Cart</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    marginTop: 8,
    backgroundColor: "#222",
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: { color: "white", textAlign: "center", fontWeight: "600" },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyBtn: {
    backgroundColor: "#222",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  qtyTxt: { color: "white", fontWeight: "bold", fontSize: 16 },
  qtyCount: { marginHorizontal: 10, fontSize: 14, fontWeight: "600" },
  priceDetails: { marginLeft: 12, fontSize: 14, fontWeight: "600", color: "#e67e22" },
});