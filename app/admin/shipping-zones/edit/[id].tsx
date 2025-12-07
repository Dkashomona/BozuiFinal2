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

  const save = async () => {
    await updateDoc(doc(db, "shipping_zones", id as string), {
      name,
      countries: countries.split(",").map((s) => s.trim()),
      price: Number(price),
      minWeight: Number(minWeight),
      maxWeight: Number(maxWeight),
      eta,
    });

    alert("Zone updated");
    router.back();
  };

  if (!zone) return null;

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Edit Shipping Zone</Text>

      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        value={countries}
        onChangeText={setCountries}
        placeholder="Country prefixes: 40, 41, 42"
      />
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        placeholder="Price"
      />
      <TextInput
        style={styles.input}
        value={minWeight}
        onChangeText={setMinWeight}
        keyboardType="numeric"
        placeholder="Min weight (g)"
      />
      <TextInput
        style={styles.input}
        value={maxWeight}
        onChangeText={setMaxWeight}
        keyboardType="numeric"
        placeholder="Max weight (g)"
      />
      <TextInput
        style={styles.input}
        value={eta}
        onChangeText={setEta}
        placeholder="ETA (3-5 days)"
      />

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={async () => {
          await deleteDoc(doc(db, "shipping_zones", id as string));
          router.replace("/admin/shipping-zones");
        }}
      >
        <Text style={styles.deleteText}>Delete Zone</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#27ae60",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  saveText: { color: "white", textAlign: "center", fontWeight: "700" },
  deleteBtn: {
    backgroundColor: "#e74c3c",
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
  },
  deleteText: { textAlign: "center", color: "white", fontWeight: "700" },
});
