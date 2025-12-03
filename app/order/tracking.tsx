import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Button,
} from "react-native";
import { db } from "../../src/services/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";

const STEPS = [
  { key: "pending", label: "Order Placed", icon: "clipboard-outline" },
  { key: "paid", label: "Payment Confirmed", icon: "card-outline" },
  { key: "processing", label: "Preparing Order", icon: "hammer-outline" },
  { key: "shipped", label: "Shipped", icon: "cube-outline" },
  { key: "delivered", label: "Delivered", icon: "checkmark-circle-outline" },
];

export default function TrackingScreen() {
  const { id } = useLocalSearchParams(); // orderId
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🚀 Fetch order live
  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "orders", id as string), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    return unsub;
  }, [id]);

  // ⭐ Send push notification
  const sendNotification = async (title: string, body: string) => {
    if (!order?.pushToken) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  };

  // ⭐ Admin: Update order status
  const updateStatus = async (newStatus: string) => {
    await updateDoc(doc(db, "orders", id as string), {
      status: newStatus,
      updatedAt: new Date(),
    });

    sendNotification(
      "Order Update",
      `Your order is now marked as: ${newStatus}`
    );
  };

  if (loading || !order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading Tracking...</Text>
      </View>
    );
  }

  const currentStep = STEPS.findIndex((s) => s.key === order.status);
  const progress = (currentStep + 1) / STEPS.length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Order Tracking</Text>
      <Text style={styles.orderId}>Order ID: {order.orderId}</Text>

      {/* 🚀 PROGRESS BAR */}
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${progress * 100}%` },
          ]}
        />
      </View>

      {/* 🚀 TIMELINE */}
      {STEPS.map((step, index) => {
        const isCompleted = index <= currentStep;
        const isActive = order.status === step.key;

        return (
          <View key={step.key} style={styles.stepContainer}>
            <Ionicons
              name={step.icon as any}
              size={30}
              color={isCompleted ? "#4CAF50" : "#aaa"}
              style={styles.icon}
            />

            <View style={{ flex: 1 }}>
              <Text
                style={[styles.stepLabel, isCompleted && styles.completedStep]}
              >
                {step.label}
              </Text>

              {isActive && (
                <Text style={styles.activeNote}>In progress...</Text>
              )}
            </View>
          </View>
        );
      })}

      {/* ✨ ADMIN CONTROLS */}
      <Text style={styles.adminTitle}>Admin Controls</Text>

      {STEPS.map((s) => (
        <Button
          key={s.key}
          title={`Set ${s.label}`}
          onPress={() => updateStatus(s.key)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 10 },
  orderId: { fontSize: 16, color: "#555", marginBottom: 20 },

  // Progress bar
  progressBarBackground: {
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginBottom: 30,
  },
  progressBarFill: {
    height: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },

  // Timeline
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  icon: { marginRight: 15 },
  stepLabel: { fontSize: 20, color: "#777" },
  completedStep: { color: "#4CAF50", fontWeight: "bold" },
  activeNote: { color: "#4CAF50", fontSize: 14 },

  adminTitle: {
    marginTop: 40,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
