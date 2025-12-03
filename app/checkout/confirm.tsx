import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useCartStore } from "../../src/store/cartStore";
import { useAuth } from "../../src/store/authStore";
import { createOrder } from "../../api/orders";

export default function ConfirmOrderScreen() {
  const items = useCartStore((s) => s.items);
  const { currentUser } = useAuth();

  const placeOrder = async () => {
    if (!currentUser) {
      alert("Please log in first");
      return;
    }

    if (!currentUser.address) {
      alert("You must add a shipping address first.");
      return;
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Create order in backend
    const order = await createOrder(items, subtotal, currentUser.address);

    const orderId = String(order.orderId);

    // Move to payment
    router.push({
      pathname: "/checkout/payment",
      params: { orderId },
    });
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Confirm Order</Text>

      <View style={styles.box}>
        <Text style={styles.label}>Items: {items.length}</Text>
        <Text style={styles.label}>
          Total: ${items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={placeOrder}>
        <Text style={styles.buttonText}>Continue to Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },
  box: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  label: {
    fontSize: 16,
    marginVertical: 4,
  },
  button: {
    backgroundColor: "#e67e22",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
