import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  TextInput,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { db } from "@/src/services/firebase";
import {
  doc,
  getDoc,
  onSnapshot, // ✅ REQUIRED
} from "firebase/firestore";
import AdminHeader from "@/src/components/admin/AdminHeader";
import { useAuth } from "@/src/store/authStore";
import { requestRefund } from "@/src/services/refundService";

export default function OrderDetails() {
  const params = useLocalSearchParams();
  const { currentUser } = useAuth();

  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [role, setRole] = useState<"admin" | "customer">("customer");
  const [loading, setLoading] = useState(true);

  /* REFUND STATE (REAL-TIME) */
  const [refund, setRefund] = useState<any | null>(null);
  const [refundLoading, setRefundLoading] = useState(true);
  const [refundReason, setRefundReason] = useState("");
  const [requestingRefund, setRequestingRefund] = useState(false);

  /* -----------------------------
     NORMALIZE PARAM
  ----------------------------- */
  useEffect(() => {
    const raw = params?.id;
    if (Array.isArray(raw)) setOrderId(raw[0]);
    else if (typeof raw === "string") setOrderId(raw);
  }, [params]);

  /* -----------------------------
     LOAD ROLE
  ----------------------------- */
  useEffect(() => {
    if (!currentUser) return;

    getDoc(doc(db, "users", currentUser.uid)).then((snap) => {
      if (snap.exists() && snap.data().role === "admin") {
        setRole("admin");
      }
    });
  }, [currentUser]);

  /* -----------------------------
     LIVE REFUND LISTENER
  ----------------------------- */
  useEffect(() => {
    if (!currentUser || !orderId) return;

    const refundId = `${currentUser.uid}_${orderId}`;
    const refundRef = doc(db, "refundRequests", refundId);

    const unsub = onSnapshot(refundRef, (snap) => {
      if (snap.exists()) {
        setRefund({ id: snap.id, ...snap.data() });
      } else {
        setRefund(null);
      }
      setRefundLoading(false);
    });

    return unsub;
  }, [currentUser, orderId]);

  /* -----------------------------
     LOAD ORDER
  ----------------------------- */
  useEffect(() => {
    if (!orderId) return;

    setLoading(true);
    getDoc(doc(db, "orders", orderId)).then((snap) => {
      if (snap.exists()) setOrder(snap.data());
      setLoading(false);
    });
  }, [orderId]);

  /* -----------------------------
     LOADING / ERROR
  ----------------------------- */
  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading order…</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Order not found</Text>
      </View>
    );
  }

  /* -----------------------------
     REFUND ELIGIBILITY
  ----------------------------- */
  const canRequestRefund =
    role === "customer" &&
    !!order.paymentIntentId &&
    ["paid", "delivered"].includes(order.status) &&
    !refund &&
    order.status !== "refunded";

  /* -----------------------------
     SUBMIT REFUND
  ----------------------------- */
  async function handleRequestRefund() {
    if (!orderId) return;

    setRequestingRefund(true);
    try {
      await requestRefund({
        orderId,
        reason: refundReason,
      });
      setRefundReason("");
    } finally {
      setRequestingRefund(false);
    }
  }

  /* -----------------------------
     RENDER
  ----------------------------- */
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {role === "admin" && <AdminHeader title="Order Details" />}

      {Platform.OS === "web" && role !== "admin" && (
        <View style={styles.customerHeader}>
          <TouchableOpacity
            onPress={() => router.replace("/")}
            style={styles.homeButton}
          >
            <Text style={styles.homeButtonText}>Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 60 }} />
        </View>
      )}

      <ScrollView style={styles.page}>
        <View style={styles.card}>
          <Text style={styles.label}>Order ID</Text>
          <Text style={styles.value}>{orderId}</Text>
          <Text style={styles.statusBadge}>{order.status.toUpperCase()}</Text>
        </View>

        {/* ITEMS */}
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items?.map((item: any, index: number) => (
          <View key={index} style={styles.itemCard}>
            <Image
              source={
                item.image
                  ? { uri: item.image }
                  : require("../../assets/images/icon.png")
              }
              style={styles.itemImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQty}>
                Qty: {item.qty} × ${item.price.toFixed(2)}
              </Text>
              <Text style={styles.itemTotal}>
                ${(item.qty * item.price).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

        {/* TOTAL */}
        <Text style={styles.sectionTitle}>Total</Text>
        <Text style={styles.total}>${order.total.toFixed(2)}</Text>

        {/* TRACK */}
        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => router.replace(`/order/tracking?orderId=${orderId}`)}
        >
          <Text style={styles.trackText}>TRACK ORDER</Text>
        </TouchableOpacity>

        {/* REFUND STATUS (LIVE) */}
        {refund && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              Refund status: {refund.status.toUpperCase()}
            </Text>
          </View>
        )}

        {/* REQUEST REFUND */}
        {canRequestRefund && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.sectionTitle}>Request a Refund</Text>

            <TextInput
              value={refundReason}
              onChangeText={setRefundReason}
              placeholder="Tell us what went wrong (optional)"
              multiline
              style={styles.refundInput}
            />

            <TouchableOpacity
              onPress={handleRequestRefund}
              disabled={requestingRefund}
              style={[
                styles.refundButton,
                requestingRefund && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.refundButtonText}>
                {requestingRefund ? "REQUESTING…" : "REQUEST REFUND"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ===========================
   STYLES
=========================== */
const styles = StyleSheet.create({
  page: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  customerHeader: {
    backgroundColor: "#e67e22",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  headerTitle: { color: "white", fontSize: 22, fontWeight: "800" },

  homeButton: {
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  homeButtonText: {
    color: "#e67e22",
    fontWeight: "800",
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
  },

  label: { fontWeight: "700" },
  value: { marginBottom: 10 },
  statusBadge: {
    color: "white",
    backgroundColor: "#3498db",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  sectionTitle: { fontSize: 22, fontWeight: "700", marginVertical: 10 },

  itemCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 14,
    marginBottom: 15,
  },

  itemImage: { width: 80, height: 80, borderRadius: 10, marginRight: 14 },

  itemName: { fontWeight: "700" },
  itemQty: { color: "#555" },
  itemTotal: { fontWeight: "700" },

  total: { fontSize: 30, fontWeight: "800" },

  trackButton: {
    backgroundColor: "#007bff",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  trackText: { color: "white", fontWeight: "700" },

  refundInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    marginBottom: 12,
  },

  refundButton: {
    backgroundColor: "#c0392b",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  refundButtonText: {
    color: "white",
    fontWeight: "700",
  },

  successBox: {
    backgroundColor: "#e8f8f5",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },

  successText: {
    color: "#1abc9c",
    fontWeight: "700",
    textAlign: "center",
  },
});
