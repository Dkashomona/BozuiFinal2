import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../src/store/authStore";

export default function RootLayout() {
  const { init } = useAuth();

  // ✅ DO NOT rename the key
  const [fontsLoaded] = useFonts(Ionicons.font);

  useEffect(() => {
    init();
  }, [init]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
  );
}
