import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { db } from "../../../src/services/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const q = query(
        collection(db, "notifications"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);

      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setNotifications(list);
    }
    load();
  }, []);

  return (
    <ScrollView style={styles.page}>
      {/* 🔙 BACK BUTTON */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.push("/admin" as Href)}
      >
        <Text style={styles.backBtnText}>← Back to Admin Panel</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Notifications Center</Text>

      {notifications.map((n) => (
        <View key={n.id} style={styles.card}>
          <Text style={styles.titleText}>{n.title}</Text>
          <Text style={styles.body}>{n.body}</Text>
          <Text style={styles.date}>
            {n.createdAt?.toDate?.().toLocaleString?.() ?? ""}
          </Text>
        </View>
      ))}

      {/* FIXED: Typed route object */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/admin/notifications/send",
          } as unknown as Href)
        }
      >
        <Text style={styles.buttonText}>Send New Notification</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#fff", flex: 1 },

  backBtn: { paddingVertical: 10, marginBottom: 10 },
  backBtnText: { color: "#e67e22", fontSize: 16, fontWeight: "600" },

  title: { fontSize: 28, fontWeight: "700", marginBottom: 20 },

  card: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 15,
  },
  titleText: { fontSize: 18, fontWeight: "700" },
  body: { fontSize: 14, color: "#777", marginTop: 4 },
  date: { marginTop: 6, fontSize: 12, color: "#aaa" },

  button: {
    backgroundColor: "#e67e22",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 50,
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
});
