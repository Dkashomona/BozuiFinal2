import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Button,
} from "react-native";

import { db } from "../../src/services/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "expo-router";

import type { Order, OrderStatus } from "../../src/types/Order";

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<(Order & { docId: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const list: (Order & { docId: string })[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Order;

        // ⭐ FIX: Avoid conflict — store Firestore ID separately
        list.push({
          docId: docSnap.id,
          ...data,
        });
      });

      setOrders(list);
      setLoading(false);
    });

    return unsub;
  }, []);

  const updateStatus = async (docId: string, status: OrderStatus) => {
    await updateDoc(doc(db, "orders", docId), {
      status,
      updatedAt: new Date(),
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading Orders...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Orders Dashboard</Text>

      {orders.map((order) => (
        <TouchableOpacity
          key={order.docId}
          style={styles.orderCard}
          onPress={() =>
            router.push({
              pathname: "/order/tracking",
              params: { id: order.orderId },
            })
          }
        >
          <Text style={styles.orderId}>Order #{order.orderId}</Text>

          <Text style={styles.amount}>
            Total: ${(order.amount / 100).toFixed(2)}
          </Text>

          <Text
            style={[
              styles.status,
              styles[order.status as OrderStatus],
            ]}
          >
            {order.status.toUpperCase()}
          </Text>

          <Text style={styles.email}>{order.email ?? "Unknown customer"}</Text>

          <View style={styles.btnRow}>
            <Button title="Paid" onPress={() => updateStatus(order.docId, "paid")} />
            <Button title="Processing" onPress={() => updateStatus(order.docId, "processing")} />
            <Button title="Shipped" onPress={() => updateStatus(order.docId, "shipped")} />
            <Button title="Delivered" onPress={() => updateStatus(order.docId, "delivered")} />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
  },
  orderId: {
    fontSize: 20,
    fontWeight: "bold",
  },
  amount: {
    fontSize: 18,
    marginTop: 5,
  },
  email: {
    color: "#666",
    marginTop: 5,
  },
  status: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
    color: "#fff",
    fontWeight: "bold",
  },

  pending: { backgroundColor: "#999" },
  paid: { backgroundColor: "#0091EA" },
  processing: { backgroundColor: "#FF9800" },
  shipped: { backgroundColor: "#3F51B5" },
  delivered: { backgroundColor: "#4CAF50" },

  btnRow: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
