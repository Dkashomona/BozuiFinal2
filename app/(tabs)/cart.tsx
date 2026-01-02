import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useCartStore } from "../../src/store/cartStore";
import CartButton from "../../src/components/cart/CartButton";
import { useEffect, useState } from "react";
import { getCampaigns } from "../../src/services/campaignService";
import { auth, db } from "../../src/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import CartSummary from "../../src/components/cart/CartSummary";
import { router } from "expo-router";
import { useAuth } from "../../src/store/authStore";

export default function CartScreen() {
  const items = useCartStore((s) => s.items);
  const { currentUser } = useAuth();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);

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

  const handleCheckout = () => {
    if (!currentUser) {
      router.push("/login?redirect=checkout");
      return;
    }
    router.push("/checkout");
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>🛒 Your Cart</Text>

      {/* LOGIN STATUS */}
      <View style={styles.loginBox}>
        <Text style={styles.loginText}>
          {currentUser
            ? `Signed in as: ${currentUser.email}`
            : "You are browsing as Guest"}
        </Text>

        {!currentUser && (
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.signInText}>Sign in to Checkout</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CART ITEMS (NO DISCOUNT LOGIC HERE) */}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const price = Number(item.price) || 0;
          const qty = Number(item.qty) || 1;

          return (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>${(price * qty).toFixed(2)}</Text>
              </View>

              <CartButton product={item} showPriceDetails />
            </View>
          );
        }}
      />

      {/* CART SUMMARY (ALL DISCOUNTS HERE) */}
      <CartSummary
        items={items}
        campaigns={campaigns}
        userData={userData}
        zip={userData?.address?.zip || ""}
      />

      {/* CHECKOUT */}
      <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
        <Text style={styles.checkoutText}>
          {currentUser ? "Proceed to Checkout" : "Sign in to Checkout"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },

  loginBox: {
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ffeeba",
  },
  loginText: { fontSize: 14, fontWeight: "600", color: "#8a6d3b" },

  signInBtn: {
    marginTop: 8,
    backgroundColor: "#e6b800",
    padding: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  signInText: { fontWeight: "700", fontSize: 14 },

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

  price: {
    fontSize: 14,
    color: "#333",
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
