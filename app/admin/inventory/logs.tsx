// app/admin/inventory/logs.tsx
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useEffect, useState, useMemo } from "react";
import { db } from "../../../src/services/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { router } from "expo-router";
import * as XLSX from "xlsx";

export default function InventoryLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { width } = useWindowDimensions();
  const isWeb = width > 850; // Table on Web, Cards on mobile

  /** Load database logs */
  useEffect(() => {
    async function loadLogs() {
      const q = query(
        collection(db, "inventory_logs"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);

      const list: any[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setLogs(list);
    }
    loadLogs();
  }, []);

  /** Filter + Sort + Search */
  const filtered = useMemo(() => {
    let data = [...logs];

    if (search.trim())
      data = data.filter((x) =>
        x.productId.toLowerCase().includes(search.toLowerCase())
      );

    if (filter !== "all") {
      if (filter === "increase") data = data.filter((x) => x.amount > 0);
      if (filter === "decrease") data = data.filter((x) => x.amount < 0);
      if (filter === "damage") data = data.filter((x) => x.reason === "damage");
    }

    data.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (sortDir === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return data;
  }, [logs, search, filter, sortKey, sortDir]);

  /** Export Excel — Only on Web */
  function exportExcel() {
    if (Platform.OS !== "web") return;

    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Logs");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_logs.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /** Column sort toggle */
  const sortColumn = (key: string) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 🟧 Sticky Modern Header */}
      <View style={styles.header}>
        {/* ⬅ Beautiful Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Stock Adjustment Logs</Text>

        {/* WEB ONLY EXPORT BUTTON */}
        {Platform.OS === "web" && (
          <TouchableOpacity style={styles.exportBtn} onPress={exportExcel}>
            <Text style={styles.exportBtnText}>⬇ Export Excel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 🔍 Search + Filters */}
      <View style={styles.toolbar}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search logs..."
          style={styles.search}
        />

        <View style={styles.filters}>
          {[
            { key: "all", label: "All" },
            { key: "increase", label: "Increase" },
            { key: "decrease", label: "Decrease" },
            { key: "damage", label: "Damage" },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterChip,
                filter === f.key && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === f.key && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView style={{ flex: 1, backgroundColor: "#fafafa" }}>
        {/* 🖥 WEB — ADVANCED TABLE */}
        {isWeb && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              {[
                "productId",
                "amount",
                "newStock",
                "reason",
                "adminId",
                "createdAt",
              ].map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.th}
                  onPress={() => sortColumn(key)}
                >
                  <Text style={styles.thText}>
                    {key.toUpperCase()}{" "}
                    {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filtered.map((log, i) => (
              <View
                key={log.id}
                style={[styles.tr, i % 2 === 0 && styles.trAlt]}
              >
                <Text style={styles.td}>{log.productId}</Text>
                <Text
                  style={[
                    styles.td,
                    log.amount > 0 ? styles.green : styles.red,
                  ]}
                >
                  {log.amount}
                </Text>
                <Text style={styles.td}>{log.newStock}</Text>
                <Text style={styles.td}>{log.reason}</Text>
                <Text style={styles.td}>{log.adminId}</Text>
                <Text style={styles.td}>
                  {log.createdAt?.toDate?.().toLocaleString() ?? ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 📱 MOBILE — PREMIUM CARDS */}
        {!isWeb &&
          filtered.map((log) => (
            <View key={log.id} style={styles.card}>
              <Text style={styles.cardTitle}>🛒 {log.productId}</Text>

              <Text
                style={[
                  styles.cardAmount,
                  log.amount > 0 ? styles.green : styles.red,
                ]}
              >
                {log.amount > 0 ? "+" + log.amount : log.amount} units
              </Text>

              <Text style={styles.cardText}>New Stock: {log.newStock}</Text>
              <Text style={styles.cardText}>Reason: {log.reason}</Text>

              <Text style={styles.cardAdmin}>Admin: {log.adminId}</Text>

              <Text style={styles.cardDate}>
                {log.createdAt?.toDate?.().toLocaleString() ?? ""}
              </Text>
            </View>
          ))}
      </ScrollView>
    </View>
  );
}

/* ---------------- STYLES ------------------- */

const styles = StyleSheet.create({
  /* HEADER */
  header: {
    backgroundColor: "#e67e22",
    paddingTop: 45,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  /* BEAUTIFUL BACK BUTTON */
  backBtn: {
    backgroundColor: "white",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  backArrow: {
    fontSize: 22,
    color: "#e67e22",
    fontWeight: "bold",
  },

  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
  },

  /* EXPORT BUTTON (WEB ONLY) */
  exportBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  exportBtnText: {
    color: "#e67e22",
    fontWeight: "800",
  },

  /* SEARCH + FILTER BAR */
  toolbar: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  search: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  filters: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  filterChipActive: {
    backgroundColor: "#e67e22",
  },
  filterChipText: {
    color: "#555",
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "white",
  },

  /* WEB TABLE */
  table: {
    padding: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#eee",
    paddingVertical: 8,
    borderRadius: 6,
  },
  th: { flex: 1 },
  thText: { fontWeight: "700" },

  tr: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  trAlt: { backgroundColor: "#f9f9f9" },
  td: { flex: 1, fontSize: 13 },

  green: { color: "#27ae60", fontWeight: "700" },
  red: { color: "#c0392b", fontWeight: "700" },

  /* MOBILE CARDS */
  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardAmount: { fontSize: 20, fontWeight: "700", marginVertical: 6 },
  cardText: { fontSize: 14, marginBottom: 4 },
  cardAdmin: { fontSize: 13, color: "#555", marginTop: 6 },
  cardDate: { fontSize: 12, color: "#777", marginTop: 8 },
});
