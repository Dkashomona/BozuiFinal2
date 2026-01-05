/*

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "@/src/store/authStore";
import { useCartStore } from "@/src/store/cartStore";
import { router } from "expo-router";
import { createOrder } from "@/api/orders";

export default function CheckoutScreen() {
  const { currentUser, uid } = useAuth();
  const items = useCartStore((s) => s.items);

  // Guest
  if (!uid) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>You must sign in to checkout</Text>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.btnText}>Login / Register</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Missing address
  if (!currentUser?.address) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Address Required</Text>
        <Text style={styles.sub}>
          Before checkout, please enter your delivery address.
        </Text>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push("/profile/address")}
        >
          <Text style={styles.btnText}>Add Address</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function startOrder() {
    try {
      console.log("CALLING createOrder");

      const res = await createOrder(items, currentUser.address);

      if (!res?.orderId) {
        throw new Error("Order creation failed");
      }

      router.push(`/checkout/payment?orderId=${res.orderId}`);
    } catch (err: any) {
      console.error("Order creation failed:", err);
      alert(err.message || "Failed to create order");
    }
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Proceed to Payment</Text>

      <TouchableOpacity style={styles.btnPay} onPress={startOrder}>
        <Text style={styles.btnPayText}>Pay with Stripe</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "700" },
  sub: { marginTop: 10, textAlign: "center", color: "#666" },
  btn: {
    marginTop: 20,
    backgroundColor: "#e67e22",
    padding: 14,
    borderRadius: 10,
  },
  btnText: { color: "white", fontWeight: "700" },
  btnPay: {
    marginTop: 30,
    backgroundColor: "#27ae60",
    padding: 16,
    borderRadius: 10,
  },
  btnPayText: { color: "white", fontWeight: "700", fontSize: 18 },
});
*/

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useState, useMemo } from "react";
import { useAuth } from "@/src/store/authStore";
import { useCartStore } from "@/src/store/cartStore";
import { router } from "expo-router";
import { createOrder } from "@/api/orders";

export default function CheckoutScreen() {
  const { currentUser, uid } = useAuth();
  const items = useCartStore((s) => s.items);
  const [loading, setLoading] = useState(false);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );

  // Guest
  if (!uid) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Sign in to continue</Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.primaryText}>Login / Register</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Missing address
  if (!currentUser?.address) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Delivery address required</Text>
        <Text style={styles.sub}>
          Please add a delivery address before checkout.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/profile/address")}
        >
          <Text style={styles.primaryText}>Add Address</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function startOrder() {
    if (loading) return;

    try {
      setLoading(true);

      const res = await createOrder(items, currentUser.address);

      if (!res?.orderId) {
        throw new Error("Order creation failed");
      }

      router.push(`/checkout/payment?orderId=${res.orderId}`);
    } catch (err: any) {
      console.error("Order creation failed:", err);
      alert(err.message || "Failed to create order");
      setLoading(false);
    }
  }

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Proceed to payment</Text>
        <Text style={styles.sub}>
          You have {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
        </Text>

        <TouchableOpacity
          style={[styles.payBtn, loading && styles.disabled]}
          onPress={startOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payText}>Pay with Stripe</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f6f7f9",
    padding: 20,
  },

  header: {
    paddingVertical: 12,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  card: {
    marginTop: 30,
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,

    ...(Platform.OS === "web" && {
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    }),
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  sub: {
    marginTop: 8,
    textAlign: "center",
    color: "#666",
  },

  primaryBtn: {
    marginTop: 20,
    backgroundColor: "#e67e22",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },

  payBtn: {
    marginTop: 30,
    backgroundColor: "#27ae60",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  disabled: {
    opacity: 0.7,
  },

  payText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
