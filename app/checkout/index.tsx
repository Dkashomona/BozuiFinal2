import { Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useCartStore } from "../../src/store/cartStore";
import DeliverySelector from "../../src/components/cart/DeliverySelector";
import CartSummary from "../../src/components/cart/CartSummary";
import type { DeliveryKey } from "../../src/services/deliveryService";

export default function CheckoutScreen() {
  const items = useCartStore((s) => s.items);

  const [region] = useState("KY");
  const [delivery, setDelivery] = useState<DeliveryKey>("STANDARD");

  const goAddress = () => router.push("/checkout/address");
  const goPayment = () => router.push("/checkout/payment");
  const goConfirm = () => router.push("/checkout/confirm");

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Checkout</Text>

      {/* SHIPPING ADDRESS */}
      <TouchableOpacity style={styles.section} onPress={goAddress}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
      </TouchableOpacity>

      {/* PAYMENT */}
      <TouchableOpacity style={styles.section} onPress={goPayment}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
      </TouchableOpacity>

      {/* DELIVERY */}
      <DeliverySelector selected={delivery} onChange={setDelivery} />

      {/* SUMMARY */}
      <CartSummary
        items={items}
        campaigns={[]}
        userData={null}
        region={region}
        delivery={delivery}
      />

      {/* CONFIRM ORDER */}
      <TouchableOpacity style={styles.placeOrder} onPress={goConfirm}>
        <Text style={styles.placeOrderText}>Place Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  section: {
    backgroundColor: "#fff",
    padding: 12,
    marginTop: 16,
    borderRadius: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  placeOrder: {
    marginTop: 20,
    backgroundColor: "#e67e22",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  placeOrderText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
