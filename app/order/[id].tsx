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

      {/* ORDER ID */}
      <Text style={{ fontSize: 16, color: "#555" }}>Order ID:</Text>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>
        {order.orderId}
      </Text>

      {/* STATUS */}
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

      {/* ITEMS */}
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

      {/* TOTAL */}
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

      {/* TRACKING BUTTON */}
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
