import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { requestRefund } from "@/src/services/refundService";

type Props = {
  orderId: string;
  orderStatus: string;
  refundStatus?: string;
};

export default function RefundRequestBox({
  orderId,
  orderStatus,
  refundStatus,
}: Props) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const canRequest =
    ["paid", "delivered"].includes(orderStatus) && refundStatus !== "requested";

  if (!canRequest) return null;

  async function handleRequest() {
    setLoading(true);
    try {
      await requestRefund({
        orderId,
        reason,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request a Refund</Text>

      <Text style={styles.label}>Reason (optional)</Text>

      <TextInput
        value={reason}
        onChangeText={setReason}
        placeholder="Tell us why you want a refund"
        multiline
        style={styles.input}
      />

      <TouchableOpacity
        onPress={handleRequest}
        disabled={loading}
        style={[styles.button, loading && { opacity: 0.6 }]}
      >
        <Text style={styles.buttonText}>
          {loading ? "REQUESTING…" : "REQUEST REFUND"}
        </Text>
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
    minHeight: 80,
    marginBottom: 12,
  },

  button: {
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
