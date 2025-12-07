import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useState } from "react";

export default function NotificationsScreen() {
  const [notifs] = useState([
    {
      id: 1,
      title: "Order Shipped",
      message: "Your order #7483 has been shipped.",
      read: false,
    },
    {
      id: 2,
      title: "Order Delivered",
      message: "Order #7281 is delivered successfully.",
      read: true,
    },
  ]);

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Notifications</Text>

      {notifs.map((n) => (
        <View key={n.id} style={styles.card}>
          <Text style={styles.cardTitle}>{n.title}</Text>
          <Text style={styles.message}>{n.message}</Text>

          {!n.read && <Text style={styles.badge}>NEW</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },

  card: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  message: { marginTop: 4, color: "#555" },

  badge: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#3498db",
    color: "white",
    borderRadius: 6,
    fontWeight: "700",
  },
});
