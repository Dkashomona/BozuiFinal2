import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

import { db } from "../../src/services/firebase";
import { useAuth } from "@/src/store/authStore";
import AdminHeader from "../../src/components/admin/AdminHeader";
import { requestRefund } from "@/src/services/refundService";

/* ----------------------------------
   TRACKING STEPS
---------------------------------- */
const STEPS = [
  { key: "pending", label: "Order Placed", icon: "clipboard-outline" },
  { key: "paid", label: "Payment Confirmed", icon: "card-outline" },
  { key: "processing", label: "Preparing Order", icon: "hammer-outline" },
  { key: "shipped", label: "Shipped", icon: "cube-outline" },
  { key: "delivered", label: "Delivered", icon: "checkmark-circle-outline" },

  {
    key: "refund_requested",
    label: "Refund Requested",
    icon: "return-up-back-outline",
    refund: true,
  },
  {
    key: "refund_processing",
    label: "Refund Processing",
    icon: "time-outline",
    refund: true,
  },
  { key: "refunded", label: "Refunded", icon: "cash-outline", refund: true },
];

export default function TrackingScreen() {
  const { orderId } = useLocalSearchParams();
  const id = Array.isArray(orderId) ? orderId[0] : orderId;

  const { currentUser } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* REFUND STATE */
  const [refund, setRefund] = useState<any | null>(null);
  const [refundLoading, setRefundLoading] = useState(true);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);

  /* ----------------------------------
     LOAD ORDER (REAL-TIME)
  ---------------------------------- */
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

  /* ----------------------------------
     LOAD REFUND (REAL-TIME)
  ---------------------------------- */
  useEffect(() => {
    if (!currentUser || !id) return;

    const q = query(
      collection(db, "refundRequests"),
      where("orderId", "==", id),
      where("userId", "==", currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setRefund({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setRefund(null);
      }
      setRefundLoading(false);
    });

    return unsub;
  }, [currentUser, id]);

  /* ----------------------------------
     LOADING
  ---------------------------------- */
  if (loading || !order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e67e22" />
        <Text style={{ marginTop: 10 }}>Loading tracking…</Text>
      </View>
    );
  }

  /* ----------------------------------
     PROGRESS
  ---------------------------------- */
  const fulfillmentIndex = STEPS.findIndex((s) => s.key === order.status);
  const deliveryIndex = STEPS.findIndex((s) => s.key === "delivered");

  const progressIndex = refund
    ? deliveryIndex
    : fulfillmentIndex === -1
      ? 0
      : fulfillmentIndex;

  const progress = (progressIndex + 1) / STEPS.length;

  /* ----------------------------------
     REFUND RULES (FINAL)
  ---------------------------------- */
  const canRequestRefund =
    !refundLoading &&
    !refund &&
    !!order.paymentIntentId && // 🔐 REQUIRED
    ["paid", "shipped", "delivered"].includes(order.status);

  async function submitRefundRequest() {
    if (!id || !currentUser) return;

    setSubmittingRefund(true);
    try {
      await requestRefund({
        orderId: id,
        reason: refundReason,
      });
      setShowRefundForm(false);
    } finally {
      setSubmittingRefund(false);
    }
  }

  /* ----------------------------------
     BUTTON LABEL
  ---------------------------------- */
  let refundLabel = "REQUEST A REFUND";
  if (refund?.status === "pending") refundLabel = "REFUND REQUESTED";
  if (refund?.status === "processing") refundLabel = "REFUND PROCESSING";
  if (refund?.status === "refunded") refundLabel = "REFUNDED";
  if (refund?.status === "rejected") refundLabel = "REFUND REJECTED";

  /* ----------------------------------
     RENDER
  ---------------------------------- */
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <AdminHeader title="Order Tracking" />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.orderId}>Order ID: {order.id}</Text>

        {/* PROGRESS BAR */}
        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
          />
        </View>

        {/* TIMELINE */}
        {STEPS.map((step) => {
          const completed = step.refund
            ? refund?.status && step.key.includes(refund.status)
            : STEPS.findIndex((s) => s.key === step.key) <= fulfillmentIndex;

          return (
            <View key={step.key} style={styles.stepContainer}>
              <Ionicons
                name={step.icon as any}
                size={30}
                color={completed ? "#16a34a" : "#aaa"}
                style={styles.icon}
              />
              <Text style={[styles.stepLabel, completed && styles.completed]}>
                {step.label}
              </Text>
            </View>
          );
        })}

        {/* STRIPE WARNING */}
        {!order.paymentIntentId && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠ This order was not paid via Stripe and cannot be refunded.
            </Text>
          </View>
        )}

        {/* REFUND SECTION */}
        <View style={{ marginTop: 30 }}>
          {canRequestRefund ? (
            !showRefundForm ? (
              <TouchableOpacity
                onPress={() => setShowRefundForm(true)}
                style={styles.requestRefundButton}
              >
                <Text style={styles.requestRefundText}>REQUEST A REFUND</Text>
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.refundLabel}>Reason (optional)</Text>
                <TextInput
                  value={refundReason}
                  onChangeText={setRefundReason}
                  multiline
                  style={styles.refundInput}
                />
                <TouchableOpacity
                  disabled={submittingRefund}
                  onPress={submitRefundRequest}
                  style={[
                    styles.confirmRefundButton,
                    submittingRefund && { opacity: 0.6 },
                  ]}
                >
                  <Text style={styles.confirmRefundText}>
                    {submittingRefund
                      ? "SUBMITTING…"
                      : "CONFIRM REFUND REQUEST"}
                  </Text>
                </TouchableOpacity>
              </>
            )
          ) : (
            <TouchableOpacity disabled style={styles.disabledRefundButton}>
              <Text style={styles.disabledRefundText}>{refundLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* ===========================
   STYLES
=========================== */
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
  completed: { fontWeight: "700", color: "#16a34a" },

  warningBox: {
    backgroundColor: "#fdecea",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  warningText: { color: "#c0392b", fontWeight: "700" },

  requestRefundButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  requestRefundText: {
    color: "#c0392b",
    fontWeight: "700",
    fontSize: 16,
  },

  disabledRefundButton: {
    backgroundColor: "#eee",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledRefundText: {
    color: "#777",
    fontWeight: "700",
  },

  refundLabel: { marginBottom: 6, fontWeight: "600" },
  refundInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    marginBottom: 12,
  },

  confirmRefundButton: {
    backgroundColor: "#c0392b",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmRefundText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
