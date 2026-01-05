import { Platform, Text } from "react-native";
import React from "react";

/* --------------------------------------------------
   ICON NAMES (STRICT + COMPLETE)
-------------------------------------------------- */
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
  | "location-outline"
  | "search"
  | "options-outline"
  | "swap-vertical-outline"
  | "chevron-back";

type Props = {
  name: IconName;
  size?: number;
  color?: string;
};

/* --------------------------------------------------
   LOAD IONICONS (NATIVE ONLY)
-------------------------------------------------- */
let Ionicons: any;
if (Platform.OS !== "web") {
  Ionicons = require("@expo/vector-icons/Ionicons").default;
}

/* --------------------------------------------------
   WEB ICON FALLBACK (NO FONTS)
-------------------------------------------------- */
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
  search: "🔍",
  "options-outline": "≡",
  "swap-vertical-outline": "⇅",
  "chevron-back": "←",
};

/* --------------------------------------------------
   ICON COMPONENT
-------------------------------------------------- */
export function Icon({ name, size = 20, color = "#000" }: Props) {
  // 🌐 WEB — emoji fallback (no fonts, no crashes)
  if (Platform.OS === "web") {
    return (
      <Text
        style={{
          fontSize: size,
          color,
          lineHeight: size + 2,
          textAlign: "center",
        }}
      >
        {WEB_ICONS[name]}
      </Text>
    );
  }

  // 📱 NATIVE — Ionicons
  return <Ionicons name={name} size={size} color={color} />;
}
