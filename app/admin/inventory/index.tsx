// app/admin/inventory/index.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { db } from "../../../src/services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function InventoryDashboard() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadStock() {
      const snap = await getDocs(collection(db, "products"));
      const list: any[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setProducts(list);
    }
    loadStock();
  }, []);

  return (
    <ScrollView style={styles.page}>
      {/* 🔙 BACK BUTTON */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.push("/admin")}
      >
        <Text style={styles.backBtnText}>← Back to Admin Panel</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Inventory Management</Text>

      {/* List all products */}
      {products.map((p) => (
        <TouchableOpacity
          key={p.id}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/admin/inventory/adjustments",
              params: { id: p.id },
            })
          }
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.sku}>Stock: {p.stock ?? 0}</Text>
          </View>

          <Text
            style={[
              styles.badge,
              (p.stock ?? 0) <= 5 ? styles.lowStock : styles.goodStock,
            ]}
          >
            {(p.stock ?? 0) <= 5 ? "Low" : "OK"}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.logBtn}
        onPress={() => router.push("/admin/inventory/logs")}
      >
        <Text style={styles.logBtnText}>View Stock Logs</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#fff", flex: 1 },

  // 🔙 BACK BUTTON
  backBtn: {
    paddingVertical: 10,
    marginBottom: 10,
  },
  backBtnText: {
    fontSize: 16,
    color: "#e67e22",
    fontWeight: "600",
  },

  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },

  card: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  name: { fontSize: 18, fontWeight: "600" },
  sku: { fontSize: 14, color: "#777" },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    fontWeight: "600",
    color: "white",
  },
  lowStock: { backgroundColor: "#e74c3c" },
  goodStock: { backgroundColor: "#2ecc71" },

  logBtn: {
    marginTop: 30,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#e67e22",
    alignItems: "center",
  },
  logBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
});
