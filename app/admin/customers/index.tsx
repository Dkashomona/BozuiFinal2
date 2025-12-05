import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { db } from "../../../src/services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { router } from "expo-router";

export default function CustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    async function loadCustomers() {
      const snap = await getDocs(collection(db, "users"));
      const list: any[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setCustomers(list);
    }
    loadCustomers();
  }, []);

  return (
    <ScrollView style={styles.page}>
      {/* 🔙 Back to Admin Panel */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.push("/admin")}
      >
        <Text style={styles.backBtnText}>← Back to Admin Panel</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Customers</Text>

      {customers.map((c) => (
        <TouchableOpacity
          key={c.id}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/admin/customers/[id]",
              params: { id: c.id },
            })
          }
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{c.name ?? "Unnamed User"}</Text>
            <Text style={styles.email}>{c.email}</Text>
          </View>

          <Text style={styles.viewBtn}>View →</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#fff", flex: 1 },

  // 🔙 Back Button
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
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  name: { fontSize: 18, fontWeight: "600" },
  email: { fontSize: 14, color: "#777", marginTop: 2 },

  viewBtn: {
    fontWeight: "bold",
    color: "#e67e22",
    marginTop: 10,
  },
});
