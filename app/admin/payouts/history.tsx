// app/admin/payouts/history.tsx
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { db } from "../../../src/services/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function PayoutHistory() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const q = query(
        collection(db, "payout_logs"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);

      const arr: any[] = [];
      snap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
      setLogs(arr);
    }
    load();
  }, []);

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Payout History</Text>

      {logs.map((log) => (
        <View key={log.id} style={styles.card}>
          <Text style={styles.amount}>${(log.amount / 100).toFixed(2)}</Text>
          <Text style={styles.status}>Status: {log.status}</Text>
          <Text style={styles.subtext}>{log.stripePayoutId}</Text>
          <Text style={styles.date}>
            {log.createdAt?.toDate?.().toLocaleString?.()}
          </Text>
        </View>
      ))}

      {logs.length === 0 && <Text>No payouts yet</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#fff" },

  title: { fontSize: 28, fontWeight: "700", marginBottom: 20 },

  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 15,
  },
  amount: { fontSize: 22, fontWeight: "700", color: "#e67e22" },
  status: { fontSize: 16, marginVertical: 4 },
  subtext: { fontSize: 12, color: "#aaa" },
  date: { marginTop: 6, color: "#777" },
});
