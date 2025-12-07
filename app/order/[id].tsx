import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { db } from "@/src/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import AdminHeader from "@/src/components/admin/AdminHeader";
import { useAuth } from "@/src/store/authStore";

export default function OrderDetails() {
  const { id } = useLocalSearchParams();
  const orderId = Array.isArray(id) ? id[0] : id;

  const { currentUser } = useAuth();
  const [role, setRole] = useState("customer");
  const [order, setOrder] = useState<any>(null);

  // Load user role
  useEffect(() => {
    async function loadRole() {
      if (!currentUser) return;
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      if (snap.exists()) {
        setRole(snap.data().role === "admin" ? "admin" : "customer");
      }
    }
    loadRole();
  }, [currentUser]);

  // Load order
  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      const snap = await getDoc(doc(db, "orders", orderId));
      if (snap.exists()) setOrder(snap.data());
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

  // Status → style mapping (TS-safe)
  const statusStyleMap: Record<string, any> = {
    pending: styles.pending,
    paid: styles.paid,
    processing: styles.processing,
    shipped: styles.shipped,
    delivered: styles.delivered,
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ⭐ ADMIN sees standard header */}
      {role === "admin" ? (
        <AdminHeader title="Order Details" backTo="/admin" />
      ) : (
        /* ⭐ CUSTOMER sees a big beautiful HOME button */
        <View style={styles.customerHeader}>
          <TouchableOpacity
            onPress={() => router.push("/")}
            style={styles.homeButton}
          >
            <Text style={styles.homeButtonText}>🏠 Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 60 }} />
        </View>
      )}

      <ScrollView style={styles.page}>
        {/* TOP ORDER CARD */}
        <View style={styles.card}>
          <Text style={styles.label}>Order ID</Text>
          <Text style={styles.value}>{orderId}</Text>

          <Text
            style={[styles.statusBadge, statusStyleMap[order.status] || {}]}
          >
            {order.status.toUpperCase()}
          </Text>
        </View>

        {/* ITEMS */}
        <Text style={styles.sectionTitle}>Items</Text>

        {order.items?.map((item: any, index: number) => {
          const imageUrl =
            item.image || "https://via.placeholder.com/150?text=No+Image";

          return (
            <View key={index} style={styles.itemCard}>
              <Image source={{ uri: imageUrl }} style={styles.itemImage} />

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
          );
        })}

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
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 20 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  /** CUSTOMER HEADER */
  customerHeader: {
    backgroundColor: "#e67e22",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
  },

  homeButton: {
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    elevation: 5,
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
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
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
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
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
