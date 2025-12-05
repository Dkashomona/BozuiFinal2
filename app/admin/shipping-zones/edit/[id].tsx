// app/admin/shipping-zones/edit/[id].tsx
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { db } from "../../../../src/services/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export default function EditShippingZone() {
  const { id } = useLocalSearchParams();
  const [zone, setZone] = useState<any>(null);

  const [name, setName] = useState("");
  const [countries, setCountries] = useState("");
  const [price, setPrice] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [eta, setEta] = useState("");

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "shipping_zones", id as string));
      if (snap.exists()) {
        const z = snap.data();
        setZone(z);
        setName(z.name);
        setCountries(z.countries.join(", "));
        setPrice(String(z.price));
        setMinWeight(String(z.minWeight));
        setMaxWeight(String(z.maxWeight));
        setEta(z.eta);
      }
    }
    load();
  }, [id]);

  const updateZone = async () => {
    await updateDoc(doc(db, "shipping_zones", id as string), {
      name,
      countries: countries.split(",").map((s) => s.trim()),
      price: Number(price),
      minWeight: Number(minWeight),
      maxWeight: Number(maxWeight),
      eta,
    });

    alert("Zone updated!");
    router.back();
  };

  const removeZone = async () => {
    await deleteDoc(doc(db, "shipping_zones", id as string));
    alert("Zone removed");
    router.replace("/admin/shipping-zones");
  };

  if (!zone) return null;

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Edit {zone.name}</Text>

      <TextInput value={name} onChangeText={setName} style={styles.input} />
      <TextInput
        value={countries}
        onChangeText={setCountries}
        style={styles.input}
      />
      <TextInput
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        value={minWeight}
        onChangeText={setMinWeight}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        value={maxWeight}
        onChangeText={setMaxWeight}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput value={eta} onChangeText={setEta} style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={updateZone}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={removeZone}>
        <Text style={styles.deleteText}>Delete Zone</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
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

  deleteBtn: {
    backgroundColor: "#c0392b",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  deleteText: { color: "white", fontWeight: "700", fontSize: 16 },
});
