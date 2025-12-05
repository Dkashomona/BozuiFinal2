// app/admin/payouts/index.tsx
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { router, type Href } from "expo-router";
import { db } from "../../../src/services/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  type DocumentData,
} from "firebase/firestore";

export default function PayoutsHome() {
  const [totalPaid, setTotalPaid] = useState(0);
  const [lastPayout, setLastPayout] = useState<DocumentData | null>(null);

  useEffect(() => {
    async function load() {
      const q = query(
        collection(db, "payout_logs"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);

      let total = 0;
      let first: DocumentData | null = null;

      snap.forEach((doc) => {
        const d = doc.data();
        total += d.amount;
        if (!first) first = d;
      });

      setTotalPaid(total);
      setLastPayout(first);
    }

    load();
  }, []);

  return (
    <ScrollView style={styles.page}>
      {/* 🔙 Back to Admin Dashboard */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.push({ pathname: "/admin" } as Href)}
      >
        <Text style={styles.backBtnText}>← Back to Admin Panel</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Payouts Dashboard</Text>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Total Paid Out</Text>
        <Text style={styles.statValue}>${(totalPaid / 100).toFixed(2)}</Text>
      </View>

      {lastPayout && (
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Last Payout</Text>
          <Text style={styles.statValue}>
            ${(lastPayout.amount / 100).toFixed(2)}
          </Text>
          <Text style={styles.subtext}>
            {lastPayout.createdAt?.toDate?.().toLocaleString?.()}
          </Text>
        </View>
      )}

      {/* View History */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({ pathname: "/admin/payouts/history" } as Href)
        }
      >
        <Text style={styles.buttonText}>View Payout History</Text>
      </TouchableOpacity>

      {/* Manual Payout */}
      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() =>
          router.push({ pathname: "/admin/payouts/manual" } as unknown as Href)
        }
      >
        <Text style={styles.buttonSecondaryText}>Trigger Manual Payout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#fff", flex: 1 },

  backBtn: { marginBottom: 12 },
  backBtnText: { fontSize: 16, color: "#e67e22", fontWeight: "600" },

  title: { fontSize: 28, fontWeight: "700", marginBottom: 20 },

  statCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 20,
  },
  statLabel: { fontSize: 14, color: "#777" },
  statValue: { fontSize: 26, fontWeight: "700", marginTop: 5 },
  subtext: { color: "#aaa", fontSize: 12, marginTop: 6 },

  button: {
    backgroundColor: "#e67e22",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },

  buttonSecondary: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e67e22",
    alignItems: "center",
  },
  buttonSecondaryText: {
    color: "#e67e22",
    fontWeight: "700",
    fontSize: 16,
  },
});
