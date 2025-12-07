import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { useAuth } from "@/src/store/authStore";

export default function AccountSettings() {
  const { currentUser, logout } = useAuth();

  // ⭐ SAFE FALLBACK (avoids "photoURL of null")
  const name = currentUser?.displayName || currentUser?.name || "Guest User";
  const email = currentUser?.email || "Not logged in";
  const avatar =
    currentUser?.photoURL ||
    "https://ui-avatars.com/api/?name=Guest&background=random";

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Account Settings</Text>

      {/* 🔥 Profile Avatar */}
      <Image source={{ uri: avatar }} style={styles.avatar} />

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} defaultValue={name} />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} editable={false} value={email} />

      <TouchableOpacity style={styles.btnSecondary}>
        <Text style={styles.btnTextSecondary}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnLogout} onPress={logout}>
        <Text style={styles.btnLogoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, flex: 1, backgroundColor: "#fff" },

  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 20,
  },

  label: { marginTop: 10, fontWeight: "600", fontSize: 16 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },

  btnSecondary: {
    marginTop: 20,
    backgroundColor: "#eee",
    padding: 14,
    borderRadius: 10,
  },
  btnTextSecondary: { textAlign: "center", fontWeight: "700" },

  btnLogout: {
    marginTop: 30,
    backgroundColor: "#e74c3c",
    padding: 14,
    borderRadius: 10,
  },
  btnLogoutText: { color: "white", fontWeight: "700", textAlign: "center" },
});
