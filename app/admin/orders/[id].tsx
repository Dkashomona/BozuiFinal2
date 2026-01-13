// app/admin/orders/[id].tsx
/*
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

      {/* Status Buttons *
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

      {/* Add Tracking Number *
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

      {/* Cancel Order *
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
*/
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
  Alert,
} from "react-native";
import { db } from "../../../src/services/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

/**
 * Admin is NOT allowed to set PAID.
 * Payment status is Stripe-controlled only.
 */
const ADMIN_STATUS_STEPS = ["processing", "shipped", "delivered"];

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

  if (loading || !order) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#e67e22" />
      </View>
    );
  }

  const isPaid = order.status === "paid";
  const isRefundRequested = order.refundStatus === "requested";
  const isRefunded = order.status === "refunded";

  /**
   * Admin fulfillment updates ONLY
   */
  async function updateStatus(step: string) {
    if (!isPaid) {
      Alert.alert(
        "Payment Required",
        "This order is not paid. Status updates are disabled."
      );
      return;
    }

    if (isRefundRequested || isRefunded) return;

    await updateDoc(doc(db, "orders", orderId), {
      status: step,
    });
  }

  /**
   * Save tracking (forces shipped)
   */
  async function saveTracking() {
    if (!isPaid || isRefundRequested || isRefunded) return;

    await updateDoc(doc(db, "orders", orderId), {
      trackingNumber: trackingInput,
      status: "shipped",
    });
  }

  /**
   * Refund approval = mark request approved ONLY
   * Stripe refund is handled by executeRefund Cloud Function
   */
  async function approveRefund() {
    Alert.alert(
      "Approve Refund",
      "This will process a Stripe refund. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "destructive",
          onPress: async () => {
            await updateDoc(doc(db, "refundRequests", order.refundRequestId), {
              status: "approved",
              approvedAt: new Date(),
            });
          },
        },
      ]
    );
  }

  /**
   * Refund rejection does NOT touch payment state
   */
  async function rejectRefund() {
    await updateDoc(doc(db, "refundRequests", order.refundRequestId), {
      status: "rejected",
      rejectedAt: new Date(),
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

      {!order.paymentIntentId && (
        <Text style={{ marginTop: 10, color: "#c0392b" }}>
          ⚠ This order was not paid via Stripe
        </Text>
      )}

      {/* REFUND REQUEST */}
      {isRefundRequested && (
        <View
          style={{
            marginTop: 20,
            backgroundColor: "#f39c12",
            padding: 14,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Refund Requested
          </Text>

          <TouchableOpacity
            onPress={approveRefund}
            style={{
              marginTop: 12,
              backgroundColor: "#27ae60",
              padding: 12,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Approve Refund (Stripe)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={rejectRefund}
            style={{
              marginTop: 10,
              backgroundColor: "#c0392b",
              padding: 12,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Reject Refund
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STATUS BUTTONS */}
      {isPaid && !isRefundRequested && !isRefunded && (
        <>
          <Text
            style={{
              marginTop: 30,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            Fulfillment Status
          </Text>

          {ADMIN_STATUS_STEPS.map((step) => (
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
        </>
      )}

      {/* TRACKING */}
      {isPaid && !isRefundRequested && !isRefunded && (
        <>
          <Text
            style={{
              marginTop: 30,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
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
        </>
      )}
    </ScrollView>
  );
}
