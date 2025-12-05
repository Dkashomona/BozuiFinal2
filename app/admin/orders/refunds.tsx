// app/admin/orders/refunds.tsx

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { db } from "../../../src/services/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { router, type Href } from "expo-router";

// Correct typing
const STATUS_COLORS: Record<string, string> = {
  pending: "#f39c12",
  approved: "#27ae60",
  rejected: "#c0392b",
};

export default function RefundRequests() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen for refund requests
  useEffect(() => {
    const q = query(collection(db, "refunds"), where("visible", "==", true));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRefunds(data);
      setLoading(false);
    });

    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#e67e22" />
      </View>
    );
  }

  // Update refund status
  async function updateRefund(refundId: string, status: string) {
    await updateDoc(doc(db, "refunds", refundId), {
      status,
      updatedAt: new Date(),
    });
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      {/* 🔙 BACK BUTTON */}
      <TouchableOpacity
        style={{ marginBottom: 10 }}
        onPress={() => router.push("/admin")}
      >
        <Text style={{ color: "#e67e22", fontWeight: "bold" }}>
          ← Back to Admin Panel
        </Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        Refund Requests
      </Text>

      {refunds.length === 0 && (
        <Text style={{ fontSize: 16, opacity: 0.5 }}>
          No refund requests yet.
        </Text>
      )}

      {refunds.map((refund) => (
        <View
          key={refund.id}
          style={{
            backgroundColor: "white",
            padding: 18,
            marginBottom: 18,
            borderRadius: 14,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Refund #{refund.id}
          </Text>

          {/* FIXED NAVIGATION */}
          <Text style={{ marginTop: 5 }}>
            Order:{" "}
            <Text
              style={{ color: "#2980b9" }}
              onPress={() =>
                router.push({
                  pathname: "/admin/orders/[id]",
                  params: { id: refund.orderId },
                } satisfies Href)
              }
            >
              {refund.orderId}
            </Text>
          </Text>

          <Text style={{ marginTop: 5 }}>
            Customer: {refund.userEmail || "Unknown"}
          </Text>

          <Text style={{ marginTop: 5 }}>Reason: {refund.reason}</Text>

          {/* Status Badge */}
          <Text
            style={{
              marginTop: 10,
              paddingVertical: 5,
              paddingHorizontal: 10,
              alignSelf: "flex-start",
              borderRadius: 8,
              backgroundColor: STATUS_COLORS[refund.status] || "#ccc",
              color: "white",
              fontWeight: "bold",
            }}
          >
            {refund.status.toUpperCase()}
          </Text>

          {/* ACTION BUTTONS */}
          {refund.status === "pending" && (
            <View style={{ marginTop: 14 }}>
              <TouchableOpacity
                onPress={() => updateRefund(refund.id, "approved")}
                style={{
                  padding: 12,
                  backgroundColor: "#27ae60",
                  borderRadius: 10,
                  marginBottom: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Approve Refund
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => updateRefund(refund.id, "rejected")}
                style={{
                  padding: 12,
                  backgroundColor: "#c0392b",
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Reject Refund
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
