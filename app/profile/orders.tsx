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
import { OrderDateFilter } from "@/src/components/home/DateFilter";

/* ------------------------------------------------------
   UTILITIES
------------------------------------------------------ */

function formatDeliveryStatus(order: any) {
  const now = new Date();
  const created = new Date(order.createdAt?.toMillis?.() ?? order.createdAt);

  if (order.status === "delivered") {
    return `Delivered ${created.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  }

  if (order.status === "canceled") return "Order canceled";

  if (order.eta) {
    const eta = new Date(order.eta);
    const diffDays = (eta.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 1) return "Arriving today";
    if (diffDays < 2) return "Arriving tomorrow";

    return `Arriving ${eta.toLocaleDateString("en-US", {
      weekday: "long",
    })}`;
  }

  return "Processing order";
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
   MAIN SCREEN
------------------------------------------------------ */

export default function OrdersScreen() {
  const { currentUser } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<OrderDateFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>("none");
  const [search, setSearch] = useState("");

  /* ---------------- FETCH ORDERS ---------------- */
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", currentUser.uid),
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
      const startThisYear = new Date(now.getFullYear(), 0, 1);
      const twoYearsAgo = new Date(now.getFullYear() - 2, 0, 1);

      const rules: Record<OrderDateFilter, (d: Date) => boolean> = {
        all: () => true,
        today: (d) => d.toDateString() === now.toDateString(),
        last10: (d) => (now.getTime() - d.getTime()) / 86400000 <= 10,
        last3Months: (d) =>
          d >= new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
        thisYear: (d) => d >= startThisYear,
        last2Years: (d) => d >= twoYearsAgo,
      };

      return list.filter((order) => {
        const d = new Date(order.createdAt?.toMillis?.() ?? order.createdAt);
        return rules[filter](d);
      });
    },
    [filter]
  );

  /* ---------------- SEARCH ---------------- */
  const filterBySearch = useCallback(
    (list: any[]) => {
      if (!search.trim()) return list;
      const q = search.toLowerCase();

      return list.filter((order) => {
        const matchId = order.id.toLowerCase().includes(q);
        const matchItem = order.items?.some((i: any) =>
          i.name.toLowerCase().includes(q)
        );
        return matchId || matchItem;
      });
    },
    [search]
  );

  /* ---------------- SORT ---------------- */
  const sortList = useCallback(
    (list: any[]) => {
      if (selectedSort === "deliveryStatus") {
        const rankMap = {
          delivered: 1,
          shipped: 2,
          processing: 3,
          pending: 3,
          canceled: 4,
        } as const;

        return [...list].sort((a, b) => {
          const aRank = rankMap[a.status as keyof typeof rankMap] ?? 99;
          const bRank = rankMap[b.status as keyof typeof rankMap] ?? 99;
          return aRank - bRank;
        });
      }

      const sorters: Record<string, any> = {
        priceLow: (a: any, b: any) => a.total - b.total,
        priceHigh: (a: any, b: any) => b.total - a.total,
        nameAZ: (a: any, b: any) =>
          a.items?.[0]?.name.localeCompare(b.items?.[0]?.name),
        nameZA: (a: any, b: any) =>
          b.items?.[0]?.name.localeCompare(a.items?.[0]?.name),
        newest: (a: any, b: any) =>
          (b.createdAt?.toMillis?.() ?? b.createdAt) -
          (a.createdAt?.toMillis?.() ?? a.createdAt),
        oldest: (a: any, b: any) =>
          (a.createdAt?.toMillis?.() ?? a.createdAt) -
          (b.createdAt?.toMillis?.() ?? b.createdAt),
      };

      return sorters[selectedSort]
        ? [...list].sort(sorters[selectedSort])
        : list;
    },
    [selectedSort]
  );

  /* ---------------- FINAL LIST ---------------- */
  const finalOrders = useMemo(
    () => sortList(filterBySearch(filterByDate(orders))),
    [orders, filterByDate, filterBySearch, sortList]
  );

  const grouped = useMemo(() => groupByYearMonth(finalOrders), [finalOrders]);

  /* ------------------------------------------------------
     RENDER
  ------------------------------------------------------ */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Your Orders</Text>

        <TouchableOpacity onPress={() => setSortOpen(true)}>
          <Text style={styles.sortBtn}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* ---------- SEARCH ---------- */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search your orders..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* ---------- BEAUTIFUL FILTER BUTTON ---------- */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFilterOpen(true)}
      >
        <Text style={styles.filterButtonText}>
          Filter: <Text style={styles.filterSelected}>{filter}</Text>
        </Text>
        <Text style={styles.filterChevron}>▾</Text>
      </TouchableOpacity>

      {/* ---------- FILTER MODAL (BEAUTIFUL) ---------- */}
      <Modal visible={filterOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Orders</Text>

            {[
              "today",
              "last10",
              "last3Months",
              "thisYear",
              "last2Years",
              "all",
            ].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.modalOption,
                  filter === opt && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setFilter(opt as OrderDateFilter);
                  setFilterOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    filter === opt && styles.modalOptionTextSelected,
                  ]}
                >
                  {opt.replace(/([A-Z])/g, " $1")}
                </Text>

                {filter === opt && <Text style={styles.modalCheck}>✓</Text>}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setFilterOpen(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ---------- ORDER LIST ---------- */}
      <ScrollView style={styles.page}>
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
                          Order #{order.id.slice(0, 8)}...
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

      {/* ---------- BOTTOM SHEET SORT MENU ---------- */}
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
  back: { color: "#fff", fontSize: 28, fontWeight: "300" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  sortBtn: { color: "#fff", fontSize: 16, fontWeight: "700" },

  searchRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  searchInput: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 10,
  },

  /* ---------- FILTER BUTTON ---------- */
  filterButton: {
    marginTop: 6,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    marginLeft: 12,
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  filterSelected: {
    color: "#0f62fe",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  filterChevron: {
    marginLeft: 6,
    fontSize: 16,
    color: "#555",
  },

  /* ---------- FILTER MODAL ---------- */
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
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  modalOptionSelected: {
    backgroundColor: "#eef5ff",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
    textTransform: "capitalize",
  },
  modalOptionTextSelected: {
    fontWeight: "700",
    color: "#0f62fe",
  },
  modalCheck: {
    fontSize: 18,
    color: "#0f62fe",
  },
  modalCancel: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#f4f4f4",
  },
  modalCancelText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "700",
    color: "#444",
  },

  /* ---------- LIST ---------- */
  page: {
    padding: 16,
  },
  year: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 20,
  },
  month: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },
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
