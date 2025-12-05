import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AdminHeader({
  title,
  backTo,
}: {
  title: string;
  backTo: string;
}) {
  return (
    <View style={styles.header}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={26} color="white" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Spacer to balance layout */}
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
    position: "sticky", // works on web
    top: 0,
    zIndex: 999,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
});
