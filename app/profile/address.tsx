import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { useAuth } from "@/src/store/authStore";
import { db } from "@/src/services/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { router } from "expo-router";

export default function AddressScreen() {
  const { uid, currentUser } = useAuth();

  const [address, setAddress] = useState(currentUser?.address || "");

  const saveAddress = async () => {
    if (!uid) return;

    await updateDoc(doc(db, "users", uid), {
      address,
    });

    alert("Address saved!");
    router.push("/checkout");
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Delivery Address</Text>

      <TextInput
        placeholder="Enter your full delivery address..."
        style={styles.input}
        multiline
        value={address}
        onChangeText={setAddress}
      />

      <TouchableOpacity style={styles.btn} onPress={saveAddress}>
        <Text style={styles.btnText}>Save Address</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    textAlignVertical: "top",
    fontSize: 16,
  },
  btn: {
    marginTop: 20,
    backgroundColor: "#27ae60",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "700", fontSize: 18 },
});
