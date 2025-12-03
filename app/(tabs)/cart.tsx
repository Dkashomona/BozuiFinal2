import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useCartStore } from "../../src/store/cartStore";
import CartButton from "../../src/components/cart/CartButton";
import { applyDiscounts } from "../../src/utils/discountEngine";
import { useEffect, useState } from "react";
import { getCampaigns } from "../../src/services/campaignService";
import { auth, db } from "../../src/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import CartSummary from "../../src/components/cart/CartSummary";
import type { DeliveryKey } from "../../src/services/deliveryService";
import { router } from "expo-router";

export default function CartScreen() {
  const items = useCartStore((s) => s.items);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);

  // Default values required by CartSummary
  const region: string = "KY";
  const delivery: DeliveryKey = "STANDARD";

  useEffect(() => {
    async function load() {
      const c = await getCampaigns();
      setCampaigns(c);

      const user = auth.currentUser;
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        setUserData(snap.exists() ? snap.data() : {});
      }
    }
    load();
  }, []);

  return (
    <View style={styles.page}>
      <Text style={styles.title}>🛒 Your Cart</Text>

      {/* CART ITEMS */}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const numericPrice = Number(item.price) || 0;
          const qty = Number(item.qty) || 1;

          const discount = applyDiscounts(
            { ...item, price: numericPrice },
            campaigns,
            userData,
            qty
          );

          return (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>

                {discount.hasDiscount ? (
                  <View style={{ gap: 2 }}>
                    <Text style={styles.oldPrice}>
                      ${discount.originalPrice.toFixed(2)}
                    </Text>

                    <Text style={styles.newPrice}>
                      ${discount.price.toFixed(2)}
                    </Text>

                    <Text style={styles.campaignTag}>
                      {discount.campaign?.title ??
                        discount.coupon?.code ??
                        "Discount Applied"}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.price}>
                    ${(numericPrice * qty).toFixed(2)}
                  </Text>
                )}
              </View>

              <CartButton product={item} showPriceDetails />
            </View>
          );
        }}
      />

      {/* CART SUMMARY */}
      <CartSummary
        items={items}
        campaigns={campaigns}
        userData={userData}
        region={region}
        delivery={delivery}
      />

      {/* ⭐ PROCEED TO CHECKOUT BUTTON */}
      <TouchableOpacity
        style={styles.checkoutBtn}
        onPress={() => router.push("/checkout")}
      >
        <Text style={styles.checkoutText}>Proceed to Checkout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
  },

  name: { fontWeight: "600", fontSize: 14, marginBottom: 4 },

  oldPrice: {
    fontSize: 12,
    color: "#888",
    textDecorationLine: "line-through",
  },

  newPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e74c3c",
  },

  price: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },

  campaignTag: {
    backgroundColor: "#FFE7D3",
    color: "#E67E22",
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "600",
  },

  checkoutBtn: {
    backgroundColor: "#e67e22",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});
