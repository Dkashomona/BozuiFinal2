// src/components/admin/AdminHeader.tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
};

export default function AdminHeader({ title }: Props) {
  // 🚫 NEVER render on native
  if (Platform.OS !== "web") return null;

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => router.replace("/admin")}
        style={styles.backBtn}
      >
        <Ionicons name="chevron-back" size={26} color="white" />
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={{ width: 26 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#e67e22",
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },

  backBtn: {
    padding: 6,
  },

  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    maxWidth: "70%",
    textAlign: "center",
  },
});
