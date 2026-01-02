import { Platform, Text } from "react-native";
import React from "react";

export type IconName =
  | "home"
  | "home-outline"
  | "cart"
  | "cart-outline"
  | "heart"
  | "heart-outline"
  | "person"
  | "person-outline"
  | "location"
  | "location-outline";

type Props = {
  name: IconName;
  size?: number;
  color?: string;
};

// Load Ionicons ONLY on native
let Ionicons: any;
if (Platform.OS !== "web") {
  Ionicons = require("@expo/vector-icons/Ionicons").default;
}

// Emoji fallback for web (NO FONTS)
const WEB_ICONS: Record<IconName, string> = {
  home: "🏠",
  "home-outline": "🏠",
  cart: "🛒",
  "cart-outline": "🛒",
  heart: "❤️",
  "heart-outline": "🤍",
  person: "👤",
  "person-outline": "👤",
  location: "📍",
  "location-outline": "📍",
};

export function Icon({ name, size = 20, color = "#000" }: Props) {
  if (Platform.OS === "web") {
    return (
      <Text style={{ fontSize: size, color, lineHeight: size + 2 }}>
        {WEB_ICONS[name]}
      </Text>
    );
  }

  return <Ionicons name={name} size={size} color={color} />;
}
