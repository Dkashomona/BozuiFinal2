// app/checkout/address.tsx
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "../../src/store/authStore";
import { db } from "../../src/services/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function AddressScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [fullname, setFullname] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("USA");
  const [phone, setPhone] = useState("");

  const saveAddress = async () => {
    if (!currentUser) return alert("Not logged in");

    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        address: { fullname, street, city, country, phone },
      },
      { merge: true }
    );

    router.back();
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Shipping Address</Text>

      <TextInput
        placeholder="Full name"
        style={styles.input}
        value={fullname}
        onChangeText={setFullname}
      />
      <TextInput
        placeholder="Street"
        style={styles.input}
        value={street}
        onChangeText={setStreet}
      />
      <TextInput
        placeholder="City"
        style={styles.input}
        value={city}
        onChangeText={setCity}
      />
      <TextInput
        placeholder="Country"
        style={styles.input}
        value={country}
        onChangeText={setCountry}
      />
      <TextInput
        placeholder="Phone"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveAddress}>
        <Text style={styles.saveText}>Save Address</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#e67e22",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
