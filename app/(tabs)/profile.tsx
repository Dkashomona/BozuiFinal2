import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // 🔥 profile icon
import LogoutButton from "../../src/components/LogoutButton"; // 🔥 logout

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      {/* 🔥 Profile icon */}
      <Ionicons name="person-circle-outline" size={80} color="#4A90E2" />

      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>User info will appear here.</Text>

      {/* 🔥 Logout button */}
      <View style={{ marginTop: 20 }}>
        <LogoutButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    color: "#555",
  },
});