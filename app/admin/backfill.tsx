import { View, Text, Button, Alert } from "react-native";
import { httpsCallable } from "firebase/functions";
import { functions, auth } from "@/src/services/firebase";

export default function BackfillScreen() {
  async function runBackfill() {
    try {
      if (!auth.currentUser) {
        Alert.alert("Not logged in");
        return;
      }

      const fn = httpsCallable(functions, "backfillOrders");
      const res: any = await fn();

      Alert.alert("Backfill complete", `Orders updated: ${res.data.updated}`);

      console.log("Orders updated:", res.data.updated);
    } catch (err: any) {
      console.error("Backfill error:", err);
      Alert.alert("Error", err?.message || "Backfill failed");
    }
  }

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>
        Backfill Orders (Admin)
      </Text>
      <Button title="Run Backfill" onPress={runBackfill} />
    </View>
  );
}
