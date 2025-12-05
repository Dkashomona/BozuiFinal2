// app/admin/shipping-zones/add-zone.tsx
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { db } from "../../../src/services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function AddShippingZone() {
  const [name, setName] = useState("");
  const [countries, setCountries] = useState("");
  const [price, setPrice] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [eta, setEta] = useState("");

  const saveZone = async () => {
    if (!name || !countries || !price) {
      alert("Please fill required fields");
      return;
    }

    await addDoc(collection(db, "shipping_zones"), {
      name,
      countries: countries.split(",").map((s) => s.trim()),
      price: Number(price),
      minWeight: Number(minWeight || 0),
      maxWeight: Number(maxWeight || 0),
      eta,
      createdAt: serverTimestamp(),
    });

    alert("Shipping zone added!");
    router.back();
  };

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Add Shipping Zone</Text>

      <TextInput
        placeholder="Zone Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Countries (comma separated)"
        style={styles.input}
        value={countries}
        onChangeText={setCountries}
      />

      <TextInput
        placeholder="Price"
        style={styles.input}
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
      <TextInput
        placeholder="Min Weight (g)"
        style={styles.input}
        keyboardType="numeric"
        value={minWeight}
        onChangeText={setMinWeight}
      />
      <TextInput
        placeholder="Max Weight (g)"
        style={styles.input}
        keyboardType="numeric"
        value={maxWeight}
        onChangeText={setMaxWeight}
      />

      <TextInput
        placeholder="ETA (e.g. 3-5 days)"
        style={styles.input}
        value={eta}
        onChangeText={setEta}
      />

      <TouchableOpacity style={styles.button} onPress={saveZone}>
        <Text style={styles.buttonText}>Save Zone</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#e67e22",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 18 },
});
