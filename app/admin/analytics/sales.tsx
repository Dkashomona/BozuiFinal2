import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { useEffect, useState } from "react";
import { db } from "../../../src/services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function SalesAnalytics() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Web-only chart components
  const [Chart, setChart] = useState<any>(null);

  useEffect(() => {
    async function loadChart() {
      if (Platform.OS === "web") {
        const Recharts = await import("recharts");
        setChart({
          LineChart: Recharts.LineChart,
          Line: Recharts.Line,
          XAxis: Recharts.XAxis,
          YAxis: Recharts.YAxis,
          Tooltip: Recharts.Tooltip,
          CartesianGrid: Recharts.CartesianGrid,
        });
      }
    }
    loadChart();
  }, []);

  useEffect(() => {
    async function loadSales() {
      const snap = await getDocs(collection(db, "orders"));

      const list: any[] = [];
      let total = 0;

      snap.forEach((doc) => {
        const d = doc.data();
        if (!d.total) return;

        list.push({
          date: d.createdAt?.toDate?.().toLocaleDateString() ?? "Unknown",
          amount: d.total,
        });

        total += d.total;
      });

      setSalesData(list);
      setTotalRevenue(total);
    }

    loadSales();
  }, []);

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Sales Analytics</Text>

      <Text style={styles.summary}>
        Total Revenue: ${totalRevenue.toFixed(2)}
      </Text>

      {/* WEB CHART */}
      {Platform.OS === "web" && Chart ? (
        <View style={{ marginTop: 20 }}>
          <Chart.LineChart width={800} height={350} data={salesData}>
            <Chart.CartesianGrid stroke="#eee" />
            <Chart.XAxis dataKey="date" />
            <Chart.YAxis />
            <Chart.Tooltip />
            <Chart.Line
              type="monotone"
              dataKey="amount"
              stroke="#e67e22"
              strokeWidth={3}
            />
          </Chart.LineChart>
        </View>
      ) : (
        // MOBILE FALLBACK
        <View style={styles.mobileFallback}>
          {salesData.map((row, i) => (
            <Text key={i} style={styles.row}>
              {row.date}:{" "}
              <Text style={{ fontWeight: "bold" }}>${row.amount}</Text>
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 10 },
  summary: { fontSize: 18, fontWeight: "600", marginTop: 10 },

  mobileFallback: {
    marginTop: 20,
    backgroundColor: "#fafafa",
    padding: 12,
    borderRadius: 12,
  },
  row: { marginBottom: 6 },
});
