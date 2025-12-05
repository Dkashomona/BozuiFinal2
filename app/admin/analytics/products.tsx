// app/admin/analytics/products.tsx
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { db } from "../../../src/services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ProductAnalytics() {
  const [ranking, setRanking] = useState<any[]>([]);

  useEffect(() => {
    async function loadAnalytics() {
      const snap = await getDocs(collection(db, "orders"));
      const productCount: Record<string, number> = {};

      snap.forEach((doc) => {
        const order = doc.data();
        order.items.forEach((item: any) => {
          productCount[item.name] = (productCount[item.name] || 0) + item.qty;
        });
      });

      const sorted = Object.entries(productCount)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty);

      setRanking(sorted);
    }

    loadAnalytics();
  }, []);

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Top Selling Products</Text>

      {ranking.map((item, idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.rank}>{idx + 1}.</Text>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.qty}>Sold: {item.qty}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
  },
  rank: { fontSize: 22, fontWeight: "bold", marginRight: 10, color: "#e67e22" },
  name: { fontSize: 18, fontWeight: "600" },
  qty: { fontSize: 14, color: "#777" },
});
