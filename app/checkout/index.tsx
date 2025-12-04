// app/checkout/index.tsx

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useCartStore } from "../../src/store/cartStore";
import { useAuth } from "../../src/store/authStore";
import { db } from "../../src/services/firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export default function CheckoutSummaryScreen() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const shippingFee = useCartStore((s) => s.shippingFee);
  const tax = useCartStore((s) => s.tax);
  const total = useCartStore((s) => s.total);

  const { currentUser } = useAuth();
  const [address, setAddress] = useState<any>(null);

  /** Load user's shipping address */
  useEffect(() => {
    async function loadAddress() {
      if (!currentUser?.uid) return;

      const snap = await getDoc(doc(db, "users", currentUser.uid));
      const data = snap.data();

      if (data?.address) {
        setAddress(data.address);
      }
    }

    loadAddress();
  }, [currentUser]);

  /** Create order in Firestore */
  const placeOrder = async () => {
    if (!currentUser) {
      alert("Please log in first.");
      return;
    }

    if (!address) {
      alert("You must add a shipping address first.");
      router.push("/checkout/address");
      return;
    }

    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // Stripe requires amount in CENTS
    const amountInCents = Math.round(Number(total) * 100);

    const orderData = {
      userId: currentUser.uid,
      address,
      items,
      subtotal,
      shippingFee,
      tax,
      total,
      amount: amountInCents, // STRIPE-REQUIRED 🔥
      status: "processing",
      createdAt: serverTimestamp(),
    };

    try {
      const ref = await addDoc(collection(db, "orders"), orderData);

      console.log("🟧 Order created:", ref.id);

      // Redirect to payment screen
      router.push(`/checkout/payment?orderId=${ref.id}`);
    } catch (err) {
      console.error("Order creation failed:", err);
      alert("Failed to create order.");
    }
  };

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Order Summary</Text>

      {/* ---- SHIPPING ADDRESS ---- */}
      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>

        {address ? (
          <>
            <Text>{address.fullname}</Text>
            <Text>{address.street}</Text>
            <Text>
              {address.city}, {address.country}
            </Text>
            <Text>Phone: {address.phone}</Text>

            <TouchableOpacity onPress={() => router.push("/checkout/address")}>
              <Text style={styles.editLink}>Edit Address</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={() => router.push("/checkout/address")}>
            <Text style={styles.missingField}>Add Shipping Address</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ---- ITEMS ---- */}
      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Items ({items.length})</Text>

        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text>
              {item.name} x{item.qty}
            </Text>
            <Text>${(item.price * item.qty).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* ---- TOTALS ---- */}
      <View style={styles.box}>
        <View style={styles.row}>
          <Text>Subtotal:</Text>
          <Text>${subtotal.toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text>Shipping:</Text>
          <Text>${shippingFee.toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text>Tax:</Text>
          <Text>${tax.toFixed(2)}</Text>
        </View>

        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalLabel}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* ---- PLACE ORDER BUTTON ---- */}
      <TouchableOpacity style={styles.placeOrderBtn} onPress={placeOrder}>
        <Text style={styles.placeOrderText}>Place Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },

  box: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },

  missingField: { color: "blue", marginTop: 8 },
  editLink: { color: "blue", marginTop: 10 },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },

  totalRow: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },

  totalLabel: { fontWeight: "700", fontSize: 16 },

  placeOrderBtn: {
    backgroundColor: "#e67e22",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
  },

  placeOrderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
