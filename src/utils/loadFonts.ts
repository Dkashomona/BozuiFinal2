import { Platform } from "react-native";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";

export async function loadFonts() {
  if (Platform.OS === "web") {
    await Font.loadAsync(Ionicons.font);
  }
}
