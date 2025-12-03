// app/checkout/payment.tsx
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { createCheckoutSession } from "../../api/orders";

export default function PaymentScreen() {
  const { orderId } = useLocalSearchParams();
  const id = Array.isArray(orderId) ? orderId[0] : String(orderId);

  const [, setLoading] = useState(true);

  useEffect(() => {
    async function startPayment() {
      try {
        const session = await createCheckoutSession({ orderId: id });

        // Stripe Checkout redirect (web + mobile)
        window.location.href = session.url;
      } catch (err: any) {
        console.error(err);
        alert("Failed to start payment.");
      } finally {
        setLoading(false);
      }
    }

    startPayment();
  }, [id]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Redirecting to Stripe…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    marginTop: 15,
    fontSize: 18,
  },
});
