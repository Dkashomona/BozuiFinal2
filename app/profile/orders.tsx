import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageStyle,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/src/store/authStore";
import { useEffect, useState } from "react";
import { db } from "@/src/services/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

export default function OrdersScreen() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setOrders(arr);
    });

    return unsub;
  }, [currentUser]);

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Your Orders</Text>

      {orders.length === 0 && (
        <Text style={styles.empty}>You have no orders yet.</Text>
      )}

      {orders.map((order) => {
        const firstItem = order.items?.[0];
        const image =
          firstItem?.image || "https://via.placeholder.com/150?text=No+Image";

        return (
          <TouchableOpacity
            key={order.id}
            style={styles.card}
            onPress={() => router.push(`/order/${order.id}`)}
          >
            {/* FIXED IMAGE STYLE */}
            <Image source={{ uri: image }} style={thumbStyle} />

            <View style={{ flex: 1 }}>
              <Text style={styles.orderId}>
                Order #{order.id.slice(0, 10)}...
              </Text>

              <Text style={[styles.statusText, statusColor(order.status)]}>
                Status: {order.status}
              </Text>

              <Text style={styles.total}>${order.total?.toFixed(2)}</Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

/* 🔥 PURE ImageStyle — NOT inside StyleSheet.create */
const thumbStyle: ImageStyle = {
  width: 65,
  height: 65,
  borderRadius: 10,
  marginRight: 12,
  backgroundColor: "#f1f1f1",
};

/* 🔥 PURE TextStyle for dynamic color */
const statusColor = (s: string) => {
  return {
    color:
      s === "processing"
        ? "#e67e22"
        : s === "delivered"
          ? "#27ae60"
          : s === "shipped"
            ? "#3498db"
            : "#555",
  };
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 15,
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#555",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },

  orderId: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },

  total: {
    fontSize: 16,
    fontWeight: "700",
  },

  chevron: {
    fontSize: 28,
    color: "#ccc",
    marginLeft: 10,
  },
});
