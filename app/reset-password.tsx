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

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");

  const submit = async () => {
    try {
      await resetPassword(email);
      alert("Reset email sent!");
      router.push("/login");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        placeholder="Enter your email"
        style={styles.input}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.btn} onPress={submit}>
        <Text style={styles.btnText}>Send Reset Link</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, flex: 1, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  input: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    borderColor: "#ddd",
  },
  btn: {
    backgroundColor: "#e67e22",
    padding: 14,
    marginTop: 20,
    borderRadius: 10,
  },
  btnText: { color: "white", fontWeight: "700", textAlign: "center" },
});
