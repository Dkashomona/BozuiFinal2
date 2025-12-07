/*
import { router } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { login } from "../src/services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onLogin() {
    try {
      await login(email, password);
      router.replace("/");     // Redirect to home
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />

      <Button title="Login" onPress={onLogin} />
    </View>
  );
}
*/
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

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const tryLogin = async () => {
    try {
      await login(email.trim(), password);
      router.replace("/"); // go home
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Welcome Back</Text>

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

      <TouchableOpacity style={styles.btn} onPress={tryLogin}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/reset-password")}>
        <Text style={styles.link}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.link}>Create an account</Text>
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
  btn: {
    backgroundColor: "#e67e22",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  btnText: { color: "white", textAlign: "center", fontWeight: "700" },
  link: { marginTop: 16, textAlign: "center", color: "#e67e22" },
});
