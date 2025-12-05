// app/admin/analytics/customers.tsx
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { db } from "../../../src/services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function CustomerAnalytics() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    async function load() {
      const userSnap = await getDocs(collection(db, "users"));
      const orderSnap = await getDocs(collection(db, "orders"));

      const list: any[] = [];
      userSnap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setCustomers(list);

      setTotalOrders(orderSnap.size);
    }

    load();
  }, []);

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Customer Analytics</Text>

      <Text style={styles.metric}>Total Customers: {customers.length}</Text>
      <Text style={styles.metric}>Total Orders: {totalOrders}</Text>

      <View style={styles.listContainer}>
        {customers.map((c) => (
          <View key={c.id} style={styles.card}>
            <Text style={styles.name}>{c.name ?? "No Name"}</Text>
            <Text style={styles.email}>{c.email}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  metric: { fontSize: 18, fontWeight: "600", marginVertical: 6 },

  listContainer: { marginTop: 20 },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: "600" },
  email: { color: "#777" },
});
