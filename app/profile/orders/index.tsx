import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ImageStyle,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/src/store/authStore";
import { useEffect, useState, useMemo, useCallback } from "react";
import { db } from "@/src/services/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

import SortMenu, { SortOption } from "@/src/components/home/SortMenu";

/* ------------------------------------------------------
   TYPES
------------------------------------------------------ */

type OrderDateFilter =
  | "all"
  | "today"
  | "thisWeek"
  | "thisMonth"
  | "last3Months"
  | "thisYear";

/* ------------------------------------------------------
   LABELS
------------------------------------------------------ */

const FILTER_LABELS: Record<OrderDateFilter, string> = {
  all: "All Orders",
  today: "Today",
  thisWeek: "This Week",
  thisMonth: "This Month",
  last3Months: "Last 3 Months",
  thisYear: "This Year",
};

/* ------------------------------------------------------
   UTILITIES
------------------------------------------------------ */

function formatDeliveryStatus(order: any) {
  if (order.status === "delivered") return "Delivered";
  if (order.status === "shipped") return "Shipped";
  if (order.status === "canceled") return "Canceled";
  return "Processing";
}

function groupByYearMonth(orders: any[]) {
  const grouped: Record<string, Record<string, any[]>> = {};

  for (const order of orders) {
    const d = new Date(order.createdAt?.toMillis?.() ?? order.createdAt);
    const year = d.getFullYear().toString();
    const month = d.toLocaleString("en-US", { month: "long" });

    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][month]) grouped[year][month] = [];

    grouped[year][month].push(order);
  }

  return grouped;
}

/* ------------------------------------------------------
   SCREEN
------------------------------------------------------ */

export default function OrdersScreen() {
  const { currentUser } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<OrderDateFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>("none");

  /* ---------------- FETCH ORDERS ---------------- */
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "orders"),
      where("uid", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snap) => {
      const arr: any[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setOrders(arr);
    });
  }, [currentUser]);

  /* ---------------- DATE FILTER ---------------- */
  const filterByDate = useCallback(
    (list: any[]) => {
      if (filter === "all") return list;

      const now = new Date();

      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0
      );

      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
        0,
        0,
        0,
        0
      );

      const threeMonthsAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 3,
        now.getDate()
      );

      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const rules: Record<OrderDateFilter, (d: Date) => boolean> = {
        all: () => true,
        today: (d) => d >= startOfToday,
        thisWeek: (d) => d >= startOfWeek,
        thisMonth: (d) => d >= startOfMonth,
        last3Months: (d) => d >= threeMonthsAgo,
        thisYear: (d) => d >= startOfYear,
      };

      return list.filter((order) => {
        const d = new Date(order.createdAt?.toMillis?.() ?? order.createdAt);
        return rules[filter](d);
      });
    },
    [filter]
  );

  /* ---------------- SORT ---------------- */
  const sortList = useCallback(
    (list: any[]) => {
      if (selectedSort === "deliveryStatus") {
        const rank: Record<string, number> = {
          delivered: 1,
          shipped: 2,
          processing: 3,
          pending: 3,
        };
        return [...list].sort(
          (a, b) => (rank[a.status] ?? 99) - (rank[b.status] ?? 99)
        );
      }
      return list;
    },
    [selectedSort]
  );

  const finalOrders = useMemo(
    () => sortList(filterByDate(orders)),
    [orders, filterByDate, sortList]
  );

  const grouped = useMemo(() => groupByYearMonth(finalOrders), [finalOrders]);

  /* ---------------- RENDER ---------------- */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Your Orders</Text>

        <TouchableOpacity onPress={() => setSortOpen(true)}>
          <Text style={styles.sortBtn}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* FILTER BUTTON */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFilterOpen(true)}
      >
        <Text style={styles.filterButtonText}>
          Filter:{" "}
          <Text style={styles.filterSelected}>{FILTER_LABELS[filter]}</Text>
        </Text>
        <Text style={styles.filterChevron}>▾</Text>
      </TouchableOpacity>

      {/* FILTER MODAL */}
      <Modal visible={filterOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {(Object.keys(FILTER_LABELS) as OrderDateFilter[]).map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.modalOption,
                  filter === key && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setFilter(key);
                  setFilterOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    filter === key && styles.modalOptionTextSelected,
                  ]}
                >
                  {FILTER_LABELS[key]}
                </Text>
                {filter === key && <Text style={styles.modalCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ORDERS */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.page}>
        {orders.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 40 }}>
            Loading orders…
          </Text>
        )}

        {Object.keys(grouped)
          .sort((a, b) => Number(b) - Number(a))
          .map((year) => (
            <View key={year}>
              <Text style={styles.year}>{year}</Text>

              {Object.keys(grouped[year]).map((month) => (
                <View key={month}>
                  <Text style={styles.month}>{month}</Text>

                  {grouped[year][month].map((order) => (
                    <TouchableOpacity
                      key={order.id}
                      style={styles.card}
                      onPress={() => router.push(`/order/${order.id}`)}
                    >
                      <Image
                        source={{
                          uri:
                            order.items?.[0]?.image ??
                            "https://via.placeholder.com/150",
                        }}
                        style={thumbStyle}
                      />

                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderId}>
                          Order #{order.id.slice(0, 8)}…
                        </Text>
                        <Text style={styles.delivery}>
                          {formatDeliveryStatus(order)}
                        </Text>
                        <Text style={styles.total}>
                          ${Number(order.total ?? 0).toFixed(2)}
                        </Text>
                      </View>

                      <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          ))}
      </ScrollView>

      <SortMenu
        visible={sortOpen}
        onClose={() => setSortOpen(false)}
        selected={selectedSort}
        onSelect={(v) => setSelectedSort(v)}
        extraOptions={[{ label: "Delivery Status", value: "deliveryStatus" }]}
      />
    </SafeAreaView>
  );
}

/* ------------------------------------------------------
   STYLES
------------------------------------------------------ */

const thumbStyle: ImageStyle = {
  width: 70,
  height: 70,
  borderRadius: 10,
  backgroundColor: "#eee",
  marginRight: 14,
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#0f1111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { color: "#fff", fontSize: 28 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  sortBtn: { color: "#fff", fontSize: 16, fontWeight: "700" },

  filterButton: {
    marginTop: 6,
    marginLeft: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f4f4f4",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterButtonText: { fontSize: 15 },
  filterSelected: { fontWeight: "700", color: "#0f62fe" },
  filterChevron: { marginLeft: 6 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  modalOptionSelected: { backgroundColor: "#eef5ff" },
  modalOptionText: { fontSize: 16 },
  modalOptionTextSelected: { fontWeight: "700", color: "#0f62fe" },
  modalCheck: { fontSize: 18, color: "#0f62fe" },

  page: { padding: 16 },
  year: { fontSize: 20, fontWeight: "800", marginTop: 20 },
  month: { fontSize: 18, fontWeight: "700", marginTop: 10 },
  card: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  orderId: { fontSize: 15, fontWeight: "700" },
  delivery: { marginTop: 4, color: "#007600" },
  total: { fontSize: 16, fontWeight: "700", marginTop: 6 },
  arrow: { fontSize: 26, color: "#ccc", marginLeft: 10 },
});
