import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { db } from "@/src/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import AdminHeader from "@/src/components/admin/AdminHeader";
import { useAuth } from "@/src/store/authStore";

export default function OrderDetails() {
  const params = useLocalSearchParams();
  const { currentUser } = useAuth();

  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [role, setRole] = useState<"admin" | "customer">("customer");
  const [loading, setLoading] = useState(true);

  // Normalize route param (WEB SAFE)
  useEffect(() => {
    const raw = params?.id;
    if (Array.isArray(raw)) setOrderId(raw[0]);
    else if (typeof raw === "string") setOrderId(raw);
  }, [params]);

  // Load role
  useEffect(() => {
    if (!currentUser) return;

    getDoc(doc(db, "users", currentUser.uid)).then((snap) => {
      if (snap.exists() && snap.data().role === "admin") {
        setRole("admin");
      }
    });
  }, [currentUser]);

  // Load order
  useEffect(() => {
    if (!orderId) return;

    setLoading(true);
    getDoc(doc(db, "orders", orderId)).then((snap) => {
      if (snap.exists()) setOrder(snap.data());
      setLoading(false);
    });
  }, [orderId]);

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

  const statusStyleMap: Record<string, any> = {
    pending: styles.pending,
    paid: styles.paid,
    processing: styles.processing,
    shipped: styles.shipped,
    delivered: styles.delivered,
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ADMIN HEADER (WEB ONLY) */}
      {role === "admin" && <AdminHeader title="Order Details" />}

      {/* CUSTOMER HEADER (WEB ONLY) */}
      {Platform.OS === "web" && role !== "admin" && (
        <View style={styles.customerHeader}>
          <TouchableOpacity
            onPress={() => router.replace("/")}
            style={styles.homeButton}
          >
            <Text style={styles.homeButtonText}>🏠 Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 60 }} />
        </View>
      )}

      <ScrollView style={styles.page}>
        <View style={styles.card}>
          <Text style={styles.label}>Order ID</Text>
          <Text style={styles.value}>{orderId}</Text>

          <Text style={[styles.statusBadge, statusStyleMap[order.status]]}>
            {order.status.toUpperCase()}
          </Text>
        </View>

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

        <Text style={styles.sectionTitle}>Total</Text>
        <Text style={styles.total}>${order.total.toFixed(2)}</Text>

        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => router.replace(`/order/tracking?orderId=${orderId}`)}
        >
          <Text style={styles.trackText}>TRACK ORDER</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ===========================
   STYLES
=========================== */
const styles = StyleSheet.create({
  page: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  customerHeader: {
    backgroundColor: "#e67e22",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontSize: 16,
    fontWeight: "800",
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
  },

  label: { fontSize: 16, fontWeight: "700", color: "#333" },
  value: { fontSize: 16, color: "#555", marginBottom: 10 },

  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },

  pending: { backgroundColor: "#f39c12" },
  paid: { backgroundColor: "#27ae60" },
  processing: { backgroundColor: "#e67e22" },
  shipped: { backgroundColor: "#3498db" },
  delivered: { backgroundColor: "#2ecc71" },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 10,
  },

  itemCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 14,
    marginBottom: 15,
  },

  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: "#f5f5f5",
  },

  itemName: { fontSize: 18, fontWeight: "700" },
  itemQty: { fontSize: 14, marginTop: 5, color: "#555" },
  itemTotal: { fontSize: 16, fontWeight: "700", marginTop: 5 },

  total: { fontSize: 30, fontWeight: "800", marginBottom: 25 },

  trackButton: {
    backgroundColor: "#007bff",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40,
  },
  trackText: { color: "white", fontSize: 18, fontWeight: "700" },
});
