import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useCartStore } from "../../store/cartStore";

export default function CartIcon() {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/(tabs)/cart")}
    >
      <Text style={styles.icon}>🛒</Text>
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { position: "relative", marginLeft: "auto" },
  icon: { fontSize: 26 },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: "white", fontSize: 12, fontWeight: "bold" },
});