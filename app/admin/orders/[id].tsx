// app/admin/orders/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { db } from "../../../src/services/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

const STATUS_STEPS = ["pending", "paid", "processing", "shipped", "delivered"];

export default function OrderDetail() {
  const { id } = useLocalSearchParams();
  const orderId = Array.isArray(id) ? id[0] : id;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState("");

  useEffect(() => {
    if (!orderId) return;

    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    return unsub;
  }, [orderId]);

  if (loading || !order)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#e67e22" />
      </View>
    );

  async function updateStatus(step: string) {
    await updateDoc(doc(db, "orders", orderId), { status: step });
  }

  async function cancelOrder() {
    await updateDoc(doc(db, "orders", orderId), { status: "cancelled" });
  }

  async function saveTracking() {
    await updateDoc(doc(db, "orders", orderId), {
      trackingNumber: trackingInput,
      status: "shipped",
    });
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 26, fontWeight: "bold" }}>Order #{orderId}</Text>

      <Text style={{ marginTop: 10, fontSize: 16 }}>
        Total: ${order.total?.toFixed(2)}
      </Text>

      <Text style={{ marginTop: 10, fontWeight: "bold" }}>
        Status: {order.status.toUpperCase()}
      </Text>

      {/* Status Buttons */}
      <Text style={{ marginTop: 30, fontSize: 20, fontWeight: "bold" }}>
        Update Status
      </Text>

      {STATUS_STEPS.map((step) => (
        <TouchableOpacity
          key={step}
          onPress={() => updateStatus(step)}
          style={{
            padding: 14,
            backgroundColor: "#e67e22",
            marginTop: 12,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Set {step.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Add Tracking Number */}
      <Text style={{ marginTop: 30, fontSize: 20, fontWeight: "bold" }}>
        Tracking Number
      </Text>

      <TextInput
        placeholder="Enter tracking number..."
        value={trackingInput}
        onChangeText={setTrackingInput}
        style={{
          backgroundColor: "white",
          padding: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#ccc",
          marginTop: 10,
        }}
      />

      <TouchableOpacity
        onPress={saveTracking}
        style={{
          marginTop: 12,
          backgroundColor: "#27ae60",
          padding: 14,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Save Tracking
        </Text>
      </TouchableOpacity>

      {/* Cancel Order */}
      <TouchableOpacity
        onPress={cancelOrder}
        style={{
          marginTop: 30,
          backgroundColor: "#c0392b",
          padding: 14,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Cancel Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
