import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentType } from "react";

type Props = {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  WebIcon: ComponentType<any>;
};

export default function AppIcon({
  name,
  size = 20,
  color = "#000",
  WebIcon,
}: Props) {
  if (Platform.OS === "web") {
    return <WebIcon size={size} color={color} />;
  }

  return <Ionicons name={name} size={size} color={color} />;
}
