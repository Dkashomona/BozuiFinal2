// app/admin/payouts/manual.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { functions, db } from "../../../src/services/firebase";
import { httpsCallable } from "firebase/functions";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Href } from "@/.expo/types/router";

export default function ManualPayout() {
  const [amount, setAmount] = useState("");

  const triggerPayout = httpsCallable(functions, "createManualPayout");

  const submit = async () => {
    if (!amount) {
      alert("Enter payout amount");
      return;
    }

    const amountCents = Math.round(Number(amount) * 100);
    if (isNaN(amountCents)) return alert("Invalid amount");

    const res: any = await triggerPayout({ amount: amountCents });

    await addDoc(collection(db, "payout_logs"), {
      amount: amountCents,
      status: res.data.status,
      stripePayoutId: res.data.payoutId,
      createdAt: serverTimestamp(),
    });

    alert("Payout sent successfully!");
    router.back();
  };

  return (
    <View style={styles.page}>
      {/* 🔙 BACK BUTTON */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() =>
          router.push({ pathname: "/admin/payouts" } as unknown as Href)
        }
      >
        <Text style={styles.backBtnText}>← Back to Payouts</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Manual Payout</Text>

      <TextInput
        placeholder="Amount in USD"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Send Payout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, flex: 1, backgroundColor: "#fff" },

  backBtn: { marginBottom: 10 },
  backBtnText: { color: "#e67e22", fontSize: 16, fontWeight: "600" },

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
