/*

import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { db } from "../../src/services/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams(); // the orderId
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, "orders", id as string), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [id]);

  if (loading || !order) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading Order…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 10 }}>
        Order Details
      </Text>

      {/* ORDER ID *
      <Text style={{ fontSize: 16, color: "#555" }}>Order ID:</Text>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>
        {order.orderId}
      </Text>

      {/* STATUS *
      <Text style={{ fontSize: 16 }}>Status:</Text>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: order.status === "paid" ? "green" : "orange",
          marginBottom: 20,
        }}
      >
        {order.status.toUpperCase()}
      </Text>

      {/* ITEMS *
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Items</Text>

      {order.items?.map((item: any, i: number) => (
        <View
          key={i}
          style={{
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderColor: "#eee",
          }}
        >
          <Text style={{ fontSize: 18 }}>{item.name}</Text>
          <Text style={{ fontSize: 16, color: "#777" }}>
            Qty: {item.qty} × {item.price / 100}$
          </Text>
        </View>
      ))}

      {/* TOTAL *
      <View
        style={{
          marginTop: 25,
          paddingVertical: 20,
          borderTopWidth: 1,
          borderColor: "#ddd",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Total</Text>
        <Text style={{ fontSize: 24, marginTop: 5 }}>
          ${order.amount / 100}
        </Text>
      </View>

      {/* TRACKING BUTTON *
      <Button
        title="Track Order"
        onPress={() =>
          router.push({
            pathname: "/order/tracking",
            params: { id: order.orderId },
          })
        }
      />
    </ScrollView>
  );
}
  */

// app/order/[id].tsx

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { db } from "@/src/services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function OrderDetails() {
  const { id } = useLocalSearchParams();
  const orderId = Array.isArray(id) ? id[0] : id;

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;

      const snap = await getDoc(doc(db, "orders", orderId));
      if (snap.exists()) {
        setOrder(snap.data());
      }
    }
    loadOrder();
  }, [orderId]);

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Loading order...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Order Details</Text>

      {/* ORDER ID */}
      <Text style={styles.label}>Order ID:</Text>
      <Text style={styles.value}>{orderId}</Text>

      {/* STATUS */}
      <Text style={styles.label}>Status:</Text>
      <Text
        style={[
          styles.status,
          order.status === "paid" ? styles.paid : styles.processing,
        ]}
      >
        {order.status.toUpperCase()}
      </Text>

      {/* ITEMS */}
      <Text style={styles.sectionTitle}>Items</Text>

      {order.items.map((item: any, index: number) => (
        <View key={index} style={styles.itemBox}>
          <Text style={styles.itemName}>{item.name}</Text>

          <Text style={styles.itemDetails}>
            Qty: {item.qty} × ${item.price.toFixed(2)}
          </Text>

          <Text style={styles.itemTotal}>
            Total: ${(item.price * item.qty).toFixed(2)}
          </Text>
        </View>
      ))}

      <View style={styles.separator} />

      {/* TOTAL */}
      <Text style={styles.sectionTitle}>Total</Text>
      <Text style={styles.total}>${order.total.toFixed(2)}</Text>

      {/* TRACK ORDER */}
      <TouchableOpacity
        style={styles.trackButton}
        onPress={() => router.push(`/order/tracking?orderId=${orderId}`)}
      >
        <Text style={styles.trackText}>TRACK ORDER</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 20, backgroundColor: "#fff" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { fontSize: 28, fontWeight: "700", marginBottom: 20 },

  label: { fontSize: 16, fontWeight: "600", marginTop: 10 },
  value: { fontSize: 16, color: "#555" },

  status: { fontSize: 18, fontWeight: "800", marginTop: 5 },
  paid: { color: "green" },
  processing: { color: "#e67e22" },

  sectionTitle: { fontSize: 22, fontWeight: "700", marginTop: 20 },

  itemBox: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  itemName: { fontSize: 18, fontWeight: "600" },

  itemDetails: { fontSize: 14, color: "#777", marginTop: 3 },

  itemTotal: { fontSize: 16, marginTop: 5, fontWeight: "600" },

  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 20,
  },

  total: { fontSize: 28, fontWeight: "800", marginBottom: 20 },

  trackButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40,
  },

  trackText: { color: "white", fontSize: 18, fontWeight: "700" },
});
