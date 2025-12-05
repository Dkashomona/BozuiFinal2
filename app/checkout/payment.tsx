// app/checkout/payment.tsx

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Linking,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { createCheckoutSession } from "../../api/orders";
import { auth } from "@/src/services/firebase";

export default function PaymentScreen() {
  const { orderId } = useLocalSearchParams();
  const id = Array.isArray(orderId) ? orderId[0] : orderId;

  useEffect(() => {
    async function startPayment() {
      try {
        const user = auth.currentUser;

        if (!user) {
          alert("Please sign in before paying.");
          return;
        }

        const session = await createCheckoutSession({
          orderId: id!,
          uid: user.uid,
        });

        if (!session.url) {
          alert("Payment session error");
          return;
        }

        // WEB
        if (Platform.OS === "web") {
          window.location.href = session.url;
          return;
        }

        // NATIVE
        const supported = await Linking.canOpenURL(session.url);
        if (supported) {
          await Linking.openURL(session.url);
        } else {
          alert("Cannot open payment link.");
        }
      } catch (err) {
        console.error(err);
        alert("Payment failed");
      }
    }

    startPayment();
  }, [id]);

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10 }}>Redirecting to payment...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
