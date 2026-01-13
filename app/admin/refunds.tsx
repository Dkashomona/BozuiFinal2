import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/src/services/firebase";

import { executeRefund, rejectRefund } from "@/src/services/adminRefundService";

type RefundRequest = {
  id: string; // 🔴 REQUIRED
  orderId: string;
  userId: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
};

export default function AdminRefundsScreen() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "refundRequests"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: RefundRequest[] = snap.docs.map((doc) => ({
        id: doc.id, // ✅ THIS WAS THE MISSING PIECE
        ...(doc.data() as Omit<RefundRequest, "id">),
      }));

      setRefunds(list);
    });

    return unsub;
  }, []);

  async function approve(refund: RefundRequest) {
    try {
      await executeRefund({ requestId: refund.id });
      Alert.alert("Refund approved");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  async function reject(refund: RefundRequest) {
    try {
      await rejectRefund({ requestId: refund.id });
      Alert.alert("Refund rejected");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Refund Requests</Text>

      {refunds.map((r) => (
        <View key={r.id} style={styles.card}>
          <Text>Order: {r.orderId}</Text>
          <Text>Reason: {r.reason}</Text>
          <Text>Status: {r.status}</Text>

          {r.status === "pending" && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.approve}
                onPress={() => approve(r)}
              >
                <Text style={styles.btnText}>Approve</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.reject} onPress={() => reject(r)}>
                <Text style={styles.btnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  approve: {
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 6,
  },
  reject: {
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 6,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
