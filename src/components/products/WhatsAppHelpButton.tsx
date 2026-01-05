import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useAdminWhatsApp } from "@/src/hooks/useAdminWhatsApp";
import { openWhatsApp } from "@/src/utils/openWhatsApp";

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
  };
  color: string | null;
  size: string | null;
};

export default function WhatsAppHelpButton({ product, color, size }: Props) {
  const { number, loading } = useAdminWhatsApp();
  const [visible, setVisible] = useState(false);
  const [customerNumber, setCustomerNumber] = useState("");
  const [address, setAddress] = useState("");

  // ⛔ HARD GUARD
  if (loading || !number) return null;

  const adminNumber = number; // guaranteed string

  function startChat() {
    if (!color || !size) {
      Alert.alert("Missing info", "Please select color and size first.");
      return;
    }

    if (!/^\d{8,15}$/.test(customerNumber)) {
      Alert.alert(
        "Invalid number",
        "Enter your WhatsApp number with country code"
      );
      return;
    }

    if (!address.trim()) {
      Alert.alert("Missing address", "Please enter your delivery address.");
      return;
    }

    const message = `
Hello 👋

I’m interested in this product:
• Name: ${product.name}
• Color: ${color}
• Size: ${size}
• Price: $${product.price}

My WhatsApp number: ${customerNumber}
Delivery address: ${address}

Please confirm availability.
    `.trim();

    setVisible(false);
    setCustomerNumber("");
    setAddress("");

    openWhatsApp(adminNumber, message);
  }

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={() => setVisible(true)}>
        <Text style={styles.text}>Chat on WhatsApp</Text>
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Your WhatsApp Number</Text>

            <TextInput
              placeholder="243812345678"
              keyboardType="phone-pad"
              value={customerNumber}
              onChangeText={setCustomerNumber}
              style={styles.input}
            />

            <TextInput
              placeholder="Delivery address (City, Street, etc.)"
              value={address}
              onChangeText={setAddress}
              style={[styles.input, { marginTop: 10 }]}
            />

            <Text style={styles.helper}>
              Country code only. No +, no spaces.
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={startChat}>
                <Text style={styles.confirm}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#25D366",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 14,
    width: "85%",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
  },
  helper: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancel: {
    color: "#999",
    fontWeight: "600",
  },
  confirm: {
    color: "#25D366",
    fontWeight: "700",
  },
});
