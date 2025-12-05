import { Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { router, type Href } from "expo-router";

function Card({ title, route }: { title: string; route: Href }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(route)}>
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function AnalyticsDashboard() {
  return (
    <ScrollView style={styles.page}>
      {/* 🔙 BACK BUTTON */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.push("/admin")}
      >
        <Text style={styles.backBtnText}>← Back to Admin Panel</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Analytics Dashboard</Text>

      <Card title="Sales Analytics" route="/admin/analytics/sales" />
      <Card title="Top Products" route="/admin/analytics/products" />
      <Card title="Customer Analytics" route="/admin/analytics/customers" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 20, backgroundColor: "#fff" },

  // 🔙 Back Button
  backBtn: {
    paddingVertical: 10,
    marginBottom: 15,
  },
  backBtnText: {
    fontSize: 16,
    color: "#e67e22",
    fontWeight: "600",
  },

  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },

  card: {
    backgroundColor: "#e67e22",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
  },
  cardTitle: { color: "white", fontWeight: "700", fontSize: 18 },
});
