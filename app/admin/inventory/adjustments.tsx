// app/admin/inventory/adjust.tsx
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { db } from "../../../src/services/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../../../src/store/authStore";

export default function AdjustInventory() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const { currentUser } = useAuth();

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      const snap = await getDoc(doc(db, "products", id as string));
      setProduct({ id: snap.id, ...snap.data() });
    }
    loadProduct();
  }, [id]);

  const adjustStock = async () => {
    if (!amount) return alert("Enter amount");
    if (!reason) return alert("Enter reason");

    const amt = Number(amount);
    if (isNaN(amt)) return alert("Invalid amount");

    const newStock = (product.stock ?? 0) + amt;

    // Update stock
    await updateDoc(doc(db, "products", id as string), { stock: newStock });

    // Create log entry
    await addDoc(collection(db, "inventory_logs"), {
      productId: id,
      amount: amt,
      newStock,
      reason,
      adminId: currentUser?.uid ?? "unknown",
      createdAt: serverTimestamp(),
    });

    alert("Stock updated!");
    router.back();
  };

  if (!product) return null;

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Adjust Stock – {product.name}</Text>
      <Text style={styles.subtitle}>Current Stock: {product.stock ?? 0}</Text>

      <TextInput
        placeholder="Amount (+ or -)"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Reason (restock, correction, damaged...)"
        style={styles.input}
        value={reason}
        onChangeText={setReason}
      />

      <TouchableOpacity style={styles.button} onPress={adjustStock}>
        <Text style={styles.buttonText}>Apply Adjustment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 26, fontWeight: "bold" },
  subtitle: { marginTop: 10, marginBottom: 20, fontSize: 16, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#e67e22",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
});
