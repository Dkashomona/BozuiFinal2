import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { DELIVERY_OPTIONS, DeliveryKey } from "../../services/deliveryService";

export type DeliverySelectorProps = {
  selected: DeliveryKey;
  onChange: (key: DeliveryKey) => void;   // 👈 FIXED HERE
};

export default function DeliverySelector({ selected, onChange }: DeliverySelectorProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Delivery Method</Text>

      {Object.entries(DELIVERY_OPTIONS).map(([key, opt]) => {
        const k = key as DeliveryKey; // 👈 Fix typing for the map entry

        return (
          <TouchableOpacity
            key={k}
            style={[styles.option, selected === k && styles.selected]}
            onPress={() => onChange(k)}  // 👈 FIXED
          >
            <Text style={styles.label}>{opt.label}</Text>
            <Text style={styles.price}>${opt.amount.toFixed(2)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { marginTop: 12, backgroundColor: "#fff", padding: 12, borderRadius: 8 },
  title: { fontWeight: "700", marginBottom: 8 },
  option: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selected: {
    borderColor: "#e67e22",
    backgroundColor: "#FFF5E9",
  },
  label: { fontWeight: "600" },
  price: { fontWeight: "700", color: "#e67e22" },
});
