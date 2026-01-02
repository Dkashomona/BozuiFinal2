import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { db } from "../../src/services/firebase";
import { doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useAuth } from "@/src/store/authStore";

// ✅ Correct AdminHeader import
import AdminHeader from "../../src/components/admin/AdminHeader";

const STEPS = [
  { key: "pending", label: "Order Placed", icon: "clipboard-outline" },
  { key: "paid", label: "Payment Confirmed", icon: "card-outline" },
  { key: "processing", label: "Preparing Order", icon: "hammer-outline" },
  { key: "shipped", label: "Shipped", icon: "cube-outline" },
  { key: "delivered", label: "Delivered", icon: "checkmark-circle-outline" },
];

export default function TrackingScreen() {
  const { orderId } = useLocalSearchParams();
  const id = Array.isArray(orderId) ? orderId[0] : orderId;

  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Determine if logged-in user is admin
  useEffect(() => {
    async function loadRole() {
      if (!currentUser) return;

      const snap = await getDoc(doc(db, "users", currentUser.uid));
      if (snap.exists()) {
        setIsAdmin(snap.data().role === "admin");
      }
    }
    loadRole();
  }, [currentUser]);

  // 🔴 Real-time order updates
  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "orders", id), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    return unsub;
  }, [id]);

  // 📲 Send push notification
  const sendNotification = async (title: string, body: string) => {
    if (!order?.pushToken) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  };

  // 🛠 Admin updates order status
  const updateStatus = async (newStatus: string) => {
    if (!id || !isAdmin) return;

    await updateDoc(doc(db, "orders", id), {
      status: newStatus,
      updatedAt: new Date(),
    });

    sendNotification("Order Update", `Your order is now: ${newStatus}`);
  };

  if (loading || !order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e67e22" />
        <Text style={{ marginTop: 10 }}>Loading Tracking...</Text>
      </View>
    );
  }

  const currentStep = STEPS.findIndex((s) => s.key === order.status);
  const progress = (currentStep + 1) / STEPS.length;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 🟧 Sticky Orange Header */}
      <AdminHeader title="Order Tracking" backTo={`/order/${id}`} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.orderId}>Order ID: {order.id}</Text>

        {/* PROGRESS BAR */}
        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
          />
        </View>

        {/* TIMELINE */}
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
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.completedStep,
                  ]}
                >
                  {step.label}
                </Text>

                {isActive && (
                  <Text style={styles.activeNote}>In progress…</Text>
                )}
              </View>
            </View>
          );
        })}

        {/* ADMIN CONTROLS */}
        {isAdmin && (
          <>
            <Text style={styles.adminTitle}>Admin Controls</Text>

            {STEPS.map((s) => (
              <View key={s.key} style={styles.adminButtonWrapper}>
                <Text
                  style={styles.adminButton}
                  onPress={() => updateStatus(s.key)}
                >
                  Set {s.label}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  orderId: { fontSize: 16, color: "#555", marginBottom: 20 },

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
    marginTop: 35,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  adminButtonWrapper: {
    marginVertical: 4,
    backgroundColor: "#e67e22",
    padding: 12,
    borderRadius: 10,
  },

  adminButton: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
