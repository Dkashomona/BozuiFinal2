import { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { db } from "../../../src/services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function NotificationSettings() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const ref = doc(db, "admin_settings", "notifications");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data: any = snap.data();
        setPushEnabled(data.push ?? true);
        setEmailEnabled(data.email ?? true);
        setSmsEnabled(data.sms ?? false);
      }

      setLoading(false);
    }

    loadSettings();
  }, []);

  async function saveSettings() {
    const ref = doc(db, "admin_settings", "notifications");
    await updateDoc(ref, {
      push: pushEnabled,
      email: emailEnabled,
      sms: smsEnabled,
      updatedAt: new Date(),
    });

    alert("Settings saved successfully!");
  }

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page}>
      {/* 🔙 Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.push("/admin/notifications/index")}
      >
        <Text style={styles.backText}>← Back to Notifications</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Notification Settings</Text>

      {/* SWITCH OPTIONS */}
      <View style={styles.row}>
        <Text style={styles.label}>Enable Push Notifications</Text>
        <Switch value={pushEnabled} onValueChange={setPushEnabled} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Enable Email Notifications</Text>
        <Switch value={emailEnabled} onValueChange={setEmailEnabled} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Enable SMS Alerts</Text>
        <Switch value={smsEnabled} onValueChange={setSmsEnabled} />
      </View>

      {/* SAVE BUTTON */}
      <TouchableOpacity style={styles.button} onPress={saveSettings}>
        <Text style={styles.buttonText}>Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#fff", flex: 1 },

  backBtn: { marginBottom: 10, paddingVertical: 4 },
  backText: { fontSize: 16, fontWeight: "600", color: "#e67e22" },

  title: { fontSize: 28, fontWeight: "700", marginBottom: 20 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  label: { fontSize: 16, fontWeight: "500" },

  button: {
    marginTop: 30,
    padding: 16,
    backgroundColor: "#e67e22",
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 17, fontWeight: "700" },

  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },
});
