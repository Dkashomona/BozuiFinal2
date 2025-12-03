import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useCartStore } from "../../store/cartStore";

export default function SavedForLater() {
  const saved = useCartStore((s) => s.saved);
  const restore = useCartStore((s) => s.restoreFromSaved);

  if (saved.length === 0) return null;

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Saved For Later</Text>

      {saved.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text style={{ flex: 1 }}>{item.name}</Text>
          <TouchableOpacity onPress={() => restore(item.id)}>
            <Text style={styles.restore}>Move to cart</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginTop: 12 },
  title: { fontWeight: "700", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  restore: { color: "#e67e22", fontWeight: "700" },
});
