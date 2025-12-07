import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../../src/store/authStore";
import { useCartStore } from "../../src/store/cartStore";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../src/services/firebase";
import { router } from "expo-router";

export default function CheckoutScreen() {
  const { currentUser, uid } = useAuth();
  const items = useCartStore((s) => s.items);

  // Guest
  if (!uid) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>You must sign in to checkout</Text>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.btnText}>Login / Register</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Missing address
  if (!currentUser?.address) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Address Required</Text>
        <Text style={styles.sub}>
          Before checkout, please enter your delivery address.
        </Text>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push("/profile/address")}
        >
          <Text style={styles.btnText}>Add Address</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function startOrder() {
    try {
      // 1️⃣ Calculate total
      const total = items.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        return sum + price * item.qty;
      }, 0);

      // 2️⃣ Create Firestore order
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: uid,
        items,
        total,
        amount: Math.round(total * 100), // Stripe needs amount in cents
        address: currentUser.address,
        status: "pending",
        createdAt: Date.now(),
      });

      // 3️⃣ Navigate to payment
      router.push(`/checkout/payment?orderId=${orderRef.id}`);
    } catch (err) {
      console.error("Order creation failed:", err);
      alert("Failed to create order");
    }
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Proceed to Payment</Text>

      <TouchableOpacity style={styles.btnPay} onPress={startOrder}>
        <Text style={styles.btnPayText}>Pay with Stripe</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "700" },
  sub: { marginTop: 10, textAlign: "center", color: "#666" },
  btn: {
    marginTop: 20,
    backgroundColor: "#e67e22",
    padding: 14,
    borderRadius: 10,
  },
  btnText: { color: "white", fontWeight: "700" },
  btnPay: {
    marginTop: 30,
    backgroundColor: "#27ae60",
    padding: 16,
    borderRadius: 10,
  },
  btnPayText: { color: "white", fontWeight: "700", fontSize: 18 },
});
