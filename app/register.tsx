import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/src/store/authStore";

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const tryRegister = async () => {
    try {
      await register(email.trim(), password, name.trim());
      router.replace("/");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Full Name"
        style={styles.input}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.btn} onPress={tryRegister}>
        <Text style={styles.btnText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, flex: 1, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 20 },
  input: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    borderColor: "#ddd",
  },
  btn: { backgroundColor: "#e67e22", padding: 14, borderRadius: 10 },
  btnText: { color: "white", textAlign: "center", fontWeight: "700" },
  link: { marginTop: 16, textAlign: "center", color: "#e67e22" },
});
