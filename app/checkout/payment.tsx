import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { createCheckoutSession } from "../../api/orders";
import { auth, authReady } from "@/src/services/firebase";

export default function PaymentScreen() {
  const { orderId } = useLocalSearchParams();
  const id = Array.isArray(orderId) ? orderId[0] : orderId;

  useEffect(() => {
    let cancelled = false;

    async function startPayment() {
      try {
        // ✅ CRITICAL: wait for auth persistence
        await authReady;

        const user = auth.currentUser;
        if (!user) {
          Alert.alert("Login required", "Please sign in before paying.");
          return;
        }

        const session = await createCheckoutSession(id!);

        if (!session?.url) {
          throw new Error("Stripe session missing URL");
        }

        if (Platform.OS === "web") {
          window.location.href = session.url;
          return;
        }

        const supported = await Linking.canOpenURL(session.url);
        if (!supported) {
          throw new Error("Cannot open Stripe URL");
        }

        await Linking.openURL(session.url);
      } catch (err: any) {
        if (cancelled) return;

        console.error("Payment error:", err);
        Alert.alert(
          "Payment failed",
          err?.message || "Please recreate your order."
        );
      }
    }

    if (id) startPayment();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10 }}>Redirecting to payment…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
