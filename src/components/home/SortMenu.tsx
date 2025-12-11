import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Platform,
  Dimensions,
} from "react-native";
import { useEffect, useRef } from "react";

export type SortOption =
  | "none"
  | "priceLow"
  | "priceHigh"
  | "nameAZ"
  | "nameZA"
  | "newest"
  | "oldest"
  | "deliveryStatus";

type ExtraOption = {
  label: string;
  value: SortOption;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  selected: SortOption;
  onSelect: (value: SortOption) => void;
  extraOptions?: ExtraOption[];
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function SortMenu({
  visible,
  onClose,
  selected,
  onSelect,
  extraOptions = [],
}: Props) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 230,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [slideAnim, visible]);

  const baseOptions: ExtraOption[] = [
    { label: "No Sorting", value: "none" },
    { label: "Price: Low → High", value: "priceLow" },
    { label: "Price: High → Low", value: "priceHigh" },
    { label: "Name: A → Z", value: "nameAZ" },
    { label: "Name: Z → A", value: "nameZA" },
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
  ];

  const allOptions = [...baseOptions, ...extraOptions];

  return (
    <Modal visible={visible} transparent animationType="none">
      {/* Background dim */}
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      />

      {/* Bottom sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Sort By</Text>

        {allOptions.map((opt) => (
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

            {selected === opt.value && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}

        {/* Cancel Button */}
        <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -2 },
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    alignSelf: "center",
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionText: {
    fontSize: 16,
  },
  selectedText: {
    fontWeight: "900",
    color: "#000",
  },
  check: {
    fontSize: 18,
    color: "#FFD814",
  },
  cancelBtn: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F2F2F2",
  },
  cancelText: {
    fontSize: 17,
    textAlign: "center",
    fontWeight: "600",
  },
});
