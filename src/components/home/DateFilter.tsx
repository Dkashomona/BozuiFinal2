import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

export type OrderDateFilter =
  | "today"
  | "last10"
  | "last3Months"
  | "thisYear"
  | "last2Years"
  | "all";

interface Props {
  selected: OrderDateFilter;
  onSelect: (v: OrderDateFilter) => void;
}

export default function DateFilter({ selected, onSelect }: Props) {
  const options: { label: string; value: OrderDateFilter }[] = [
    { label: "Today", value: "today" },
    { label: "Last 10 Days", value: "last10" },
    { label: "Last 3 Months", value: "last3Months" },
    { label: "This Year", value: "thisYear" },
    { label: "Last 2 Years", value: "last2Years" },
    { label: "All Time", value: "all" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filter by Date</Text>

      {/* Horizontal scroll if items overflow screen */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {options.map((o) => (
            <TouchableOpacity
              key={o.value}
              onPress={() => onSelect(o.value)}
              style={[
                styles.option,
                selected === o.value && styles.optionSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selected === o.value && styles.optionTextSelected,
                ]}
              >
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 20,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#F2F2F2",
  },
  optionSelected: {
    backgroundColor: "#FFD814",
    borderColor: "#E0B200",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  optionTextSelected: {
    fontWeight: "700",
    color: "#000",
  },
});
