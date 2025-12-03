import { View, Text, StyleSheet } from "react-native";

type TaxLineProps = {
  tax: number;   // 🔥 Explicit type for tax
};

export default function TaxLine({ tax }: TaxLineProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>Tax:</Text>
      <Text style={styles.val}>${tax.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  label: { fontSize: 15 },
  val: { fontSize: 15, fontWeight: "700" },
});
