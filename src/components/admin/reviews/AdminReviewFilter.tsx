import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export type FilterType = "all" | "unreplied" | "replied" | "low-stars";

type Props = {
  filter: FilterType;
  setFilter: (value: FilterType) => void;
  reviews: any[]; // <-- REQUIRED
  setFiltered: (items: any[]) => void; // <-- REQUIRED
};

export default function AdminReviewFilter({
  filter,
  setFilter,
  reviews,
  setFiltered,
}: Props) {
  const applyFilter = (key: FilterType) => {
    setFilter(key);

    let result = reviews;

    if (key === "unreplied") {
      result = reviews.filter((r) => !r.sellerReply);
    } else if (key === "replied") {
      result = reviews.filter((r) => !!r.sellerReply);
    } else if (key === "low-stars") {
      result = reviews.filter((r) => r.rating <= 3);
    }

    setFiltered(result);
  };

  const btn = (key: FilterType, label: string) => (
    <TouchableOpacity
      key={key}
      onPress={() => applyFilter(key)}
      style={[styles.btn, filter === key && styles.activeBtn]}
    >
      <Text style={[styles.btnTxt, filter === key && styles.activeTxt]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.row}>
      {btn("all", "All")}
      {btn("unreplied", "Unreplied")}
      {btn("replied", "Replied")}
      {btn("low-stars", "Low ★")}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
    flexWrap: "wrap",
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  activeBtn: {
    backgroundColor: "#222",
  },
  btnTxt: {
    color: "#555",
    fontWeight: "600",
  },
  activeTxt: {
    color: "#fff",
  },
});
