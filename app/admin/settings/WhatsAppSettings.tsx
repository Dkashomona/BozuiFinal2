import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

import AdminHeader from "@/src/components/admin/AdminHeader";
import { db } from "@/src/services/firebase";

export default function WhatsAppSettings() {
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ----------------------------------------
     LOAD NUMBER FROM FIRESTORE
  ---------------------------------------- */
  useEffect(() => {
    const ref = doc(db, "adminSettings", "contact");

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setWhatsapp(snap.data()?.whatsappNumber ?? "");
        }
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, []);

  /* ----------------------------------------
     SAVE NUMBER
  ---------------------------------------- */
  async function saveNumber() {
    if (!whatsapp.trim()) {
      Alert.alert("Validation", "WhatsApp number is required");
      return;
    }

    if (!/^\d{8,15}$/.test(whatsapp)) {
      Alert.alert(
        "Invalid number",
        "Use country code only. Example: 243812345678"
      );
      return;
    }

    try {
      setSaving(true);

      await setDoc(
        doc(db, "adminSettings", "contact"),
        {
          whatsappNumber: whatsapp.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      Alert.alert("Saved", "WhatsApp number updated");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save WhatsApp number");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <AdminHeader title="WhatsApp Settings" />
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdminHeader title="WhatsApp Settings" />

      <View style={styles.card}>
        <Text style={styles.label}>Admin WhatsApp Number</Text>

        <TextInput
          value={whatsapp}
          onChangeText={setWhatsapp}
          placeholder="243812345678"
          keyboardType="phone-pad"
          style={styles.input}
        />

        <Text style={styles.helper}>Country code only. No +, no spaces.</Text>

        <TouchableOpacity
          style={[styles.button, saving && styles.disabled]}
          onPress={saveNumber}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Saving..." : "Save Number"}
          </Text>
        </TouchableOpacity>

        {whatsapp ? (
          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Current Number</Text>
            <Text style={styles.previewValue}>{whatsapp}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/* ----------------------------------------
   STYLES
---------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  card: {
    backgroundColor: "#FFF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#FFF",
  },
  helper: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
  },
  button: {
    backgroundColor: "#25D366",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  preview: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  previewLabel: {
    fontSize: 13,
    color: "#666",
  },
  previewValue: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
});
