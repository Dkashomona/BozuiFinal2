import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  rating: number;
  onChange?: (r: number) => void;
  size?: number;
};

export default function ReviewStars({ rating, onChange, size = 22 }: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => onChange && onChange(n)}
          disabled={!onChange}
        >
          <Ionicons
            name={n <= rating ? "star" : "star-outline"}
            size={size}
            color="#FFD814"
            style={{ marginRight: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
