import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type SortOption =
  | "none"
  | "priceLow"
  | "priceHigh"
  | "nameAZ"
  | "nameZA"
  | "newest";

type Props = {
  visible: boolean;
  onClose: () => void;
  selected: SortOption;
  onSelect: (value: SortOption) => void;
};

export default function SortMenu({
  visible,
  onClose,
  selected,
  onSelect,
}: Props) {
  const options: { label: string; value: SortOption }[] = [
    { label: "No Sorting", value: "none" },
    { label: "Price: Low → High", value: "priceLow" },
    { label: "Price: High → Low", value: "priceHigh" },
    { label: "Name: A → Z", value: "nameAZ" },
    { label: "Name: Z → A", value: "nameZA" },
    { label: "Newest First", value: "newest" },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.box}>
          <Text style={styles.title}>Sort By</Text>

          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={styles.row}
              onPress={() => {
                onSelect(opt.value);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  selected === opt.value && styles.selectedText,
                ]}
              >
                {opt.label}
              </Text>

              {selected === opt.value && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color="#FFD814"
                  style={{ marginRight: 6 }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: Platform.OS === "web" ? 350 : 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  row: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 15,
    color: "#333",
  },
  selectedText: {
    fontWeight: "700",
    color: "#000",
  },
});
