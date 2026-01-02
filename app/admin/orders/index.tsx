import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from "react-native";
import { db } from "../../../src/services/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { router, type Href } from "expo-router";
import AdminHeader from "../../../src/components/admin/AdminHeader";

/* --------------------------------------------------
   CONSTANTS
-------------------------------------------------- */
const STATUS_OPTIONS = [
  "all",
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const DATE_FILTERS = ["all", "today", "7days", "30days"];

const STATUS_COLORS = {
  pending: "#f39c12",
  paid: "#27ae60",
  processing: "#2980b9",
  shipped: "#8e44ad",
  delivered: "#2ecc71",
  cancelled: "#c0392b",
};

/* --------------------------------------------------
   SCREEN
-------------------------------------------------- */
export default function OrdersDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customerSearch, setCustomerSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(data);
      setLoading(false);
    });

    return unsub;
  }, []);

  function filterByDate(order: any) {
    if (!order.createdAt?.toDate) return true;

    const created = order.createdAt.toDate();
    const now = new Date();

    if (dateFilter === "today") {
      return created.toDateString() === now.toDateString();
    }

    if (dateFilter === "7days") {
      const diff = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
      return diff <= 7;
    }

    if (dateFilter === "30days") {
      const diff = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
      return diff <= 30;
    }

    return true;
  }

  const filtered = orders
    .filter((o) => o.id.toLowerCase().includes(search.toLowerCase()))
    .filter((o) =>
      customerSearch
        ? (o.email ?? "").toLowerCase().includes(customerSearch.toLowerCase())
        : true
    )
    .filter((o) => (statusFilter === "all" ? true : o.status === statusFilter))
    .filter(filterByDate);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e67e22" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* STICKY ADMIN HEADER */}
      <AdminHeader title="Orders" />

      <ScrollView contentContainerStyle={styles.page}>
        {/* 🔍 SEARCH ORDER BY ID */}
        <TextInput
          placeholder="Search orders by ID..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />

        {/* 🔍 SEARCH BY CUSTOMER */}
        <TextInput
          placeholder="Search by customer email..."
          value={customerSearch}
          onChangeText={setCustomerSearch}
          style={styles.input}
        />

        {/* 🔘 STATUS FILTERS */}
        <ScrollView
          horizontal
          style={styles.filterRow}
          showsHorizontalScrollIndicator={false}
        >
          {STATUS_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.filterBtn,
                statusFilter === s && styles.filterBtnActive,
              ]}
              onPress={() => setStatusFilter(s)}
            >
              <Text
                style={[
                  styles.filterText,
                  statusFilter === s && styles.filterTextActive,
                ]}
              >
                {s.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 🔘 DATE FILTERS */}
        <ScrollView
          horizontal
          style={styles.filterRow}
          showsHorizontalScrollIndicator={false}
        >
          {DATE_FILTERS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.filterBtn,
                dateFilter === d && styles.filterBtnActive,
              ]}
              onPress={() => setDateFilter(d)}
            >
              <Text
                style={[
                  styles.filterText,
                  dateFilter === d && styles.filterTextActive,
                ]}
              >
                {d.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 🧾 ORDER LIST */}
        {filtered.map((order) => (
          <TouchableOpacity
            key={order.id}
            onPress={() =>
              router.push({
                pathname: "/admin/orders/[id]",
                params: { id: order.id },
              } as Href)
            }
            style={styles.card}
          >
            <Text style={styles.orderId}>Order #{order.id}</Text>

            <Text style={styles.total}>
              Totalaaaa: ${order.total?.toFixed(2) ?? "0.00"}
            </Text>

            <Text
              style={[
                styles.badge,
                {
                  backgroundColor:
                    STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] ||
                    "#ccc",
                },
              ]}
            >
              {order.status?.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}

        {filtered.length === 0 && (
          <Text style={styles.empty}>No orders match your filters.</Text>
        )}
      </ScrollView>
    </View>
  );
}

/* --------------------------------------------------
   STYLES
-------------------------------------------------- */
const styles = StyleSheet.create({
  page: {
    padding: 20,
    paddingBottom: 40,
  },

  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    backgroundColor: "white",
    marginBottom: 12,
  },

  filterRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginRight: 10,
  },

  filterBtnActive: {
    backgroundColor: "#e67e22",
  },

  filterText: {
    color: "#555",
    fontWeight: "600",
  },

  filterTextActive: {
    color: "white",
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },

  orderId: { fontSize: 16, fontWeight: "bold" },
  total: { marginTop: 4 },

  badge: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    color: "white",
    borderRadius: 8,
    fontWeight: "bold",
  },

  empty: {
    marginTop: 20,
    textAlign: "center",
    color: "#999",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
