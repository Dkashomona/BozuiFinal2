// src/components/reviews/StarRating.tsx
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StarRating({ rating, size = 24, onSelect }: any) {
  return (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity
          key={i}
          disabled={!onSelect}
          onPress={() => onSelect?.(i)}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={size}
            color="#FFD814"
            style={{ marginRight: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
