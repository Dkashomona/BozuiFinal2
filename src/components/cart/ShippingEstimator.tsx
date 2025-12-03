import { View, Text, TextInput, StyleSheet } from "react-native";
import { useState } from "react";

type ShippingEstimatorProps = {
  onEstimate: (zip: string) => void;   // ✅ define the type here
};

export default function ShippingEstimator({ onEstimate }: ShippingEstimatorProps) {
  const [zip, setZip] = useState("");

  return (
    <View style={styles.box}>
      <Text style={styles.label}>Estimate Shipping</Text>

      <TextInput
        placeholder="Enter ZIP code"
        style={styles.input}
        value={zip}
        onChangeText={(t) => {
          setZip(t);

          if (t.length >= 5) onEstimate(t);
        }}
      />

      <Text style={styles.note}>Shipping cost depends on your region.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginTop: 12 },
  label: { fontWeight: "700", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    borderRadius: 6,
  },
  note: { marginTop: 8, fontSize: 12, color: "#888" },
});
