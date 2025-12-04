// app/checkout/confirm.tsx

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useCartStore } from "../../src/store/cartStore";
import { useAuth } from "../../src/store/authStore";
import { db } from "../../src/services/firebase";
import { doc, getDoc } from "firebase/firestore";

/* ------------------------------------------
   TYPE for Address
-------------------------------------------*/
type Address = {
  fullname: string;
  street: string;
  city: string;
  country: string;
  phone: string;
};

export default function ConfirmOrderScreen() {
  const items = useCartStore((s) => s.items);
  const { currentUser } = useAuth();

  // FIXED: Address must be typed
  const [address, setAddress] = useState<Address | null>(null);

  /* ------------------------------------------
     Load Address from Firestore
  -------------------------------------------*/
  useEffect(() => {
    async function loadAddress() {
      if (!currentUser) return;

      const snap = await getDoc(doc(db, "users", currentUser.uid));
      const data = snap.data();

      if (data?.address) {
        setAddress(data.address as Address);
      }
    }

    loadAddress();
  }, [currentUser]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  /* ------------------------------------------
     Continue to Summary
  -------------------------------------------*/
  const continueToSummary = () => {
    if (!address) {
      alert("You must add a shipping address first.");
      router.push("/checkout/address");
      return;
    }

    router.push("/checkout");
  };

  /* ------------------------------------------
     UI
  -------------------------------------------*/
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Confirm Your Order</Text>

      {/* Address Block */}
      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>

        {address ? (
          <>
            <Text>{address.fullname}</Text>
            <Text>{address.street}</Text>
            <Text>
              {address.city}, {address.country}
            </Text>
            <Text>Phone: {address.phone}</Text>
          </>
        ) : (
          <TouchableOpacity onPress={() => router.push("/checkout/address")}>
            <Text style={{ color: "blue" }}>Add your shipping address</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Items Summary */}
      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Items ({items.length})</Text>

        {items.map((item) => (
          <Text key={item.id}>
            {item.name} x{item.qty} — ${item.price * item.qty}
          </Text>
        ))}

        <Text style={styles.totalLabel}>Subtotal: ${subtotal.toFixed(2)}</Text>
      </View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.button} onPress={continueToSummary}>
        <Text style={styles.buttonText}>Continue to Summary</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ------------------------------------------
   STYLES
-------------------------------------------*/
const styles = StyleSheet.create({
  page: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  box: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  totalLabel: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 16,
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
