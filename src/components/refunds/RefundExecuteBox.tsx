import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { executeRefund, rejectRefund } from "@/src/services/refundService";

type Props = {
  orderId: string;
  total: number;
  refundStatus?: string;
};

export default function RefundExecuteBox({
  orderId,
  total,
  refundStatus,
}: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (refundStatus !== "requested") return null;

  async function approve() {
    setLoading(true);
    try {
      await executeRefund({
        orderId,
        amount: amount ? Number(amount) : undefined,
      });
    } finally {
      setLoading(false);
    }
  }

  async function reject() {
    setLoading(true);
    try {
      await rejectRefund(orderId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Refund Request</Text>

      <Text style={styles.label}>Partial Refund (optional)</Text>

      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder={`Max ${total.toFixed(2)}`}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity
        onPress={approve}
        disabled={loading}
        style={[styles.approve, loading && { opacity: 0.6 }]}
      >
        <Text style={styles.buttonText}>
          {loading ? "PROCESSING…" : "APPROVE REFUND"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={reject}
        disabled={loading}
        style={[styles.reject, loading && { opacity: 0.6 }]}
      >
        <Text style={styles.buttonText}>REJECT REFUND</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  label: {
    color: "#555",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  approve: {
    backgroundColor: "#27ae60",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  reject: {
    backgroundColor: "#c0392b",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
