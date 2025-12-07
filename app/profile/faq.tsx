import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function FAQScreen() {
  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Frequently Asked Questions</Text>

      <View style={styles.block}>
        <Text style={styles.q}>📦 Where is my order?</Text>
        <Text style={styles.a}>
          You can track your order in the &quot;Orders&quot; section of your
          account.
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.q}>⏱ How long does delivery take?</Text>
        <Text style={styles.a}>
          Delivery time depends on your region. Most deliveries take 3–7 days.
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.q}>💵 How can I request a refund?</Text>
        <Text style={styles.a}>
          If your order qualifies, you can request a refund in the order details
          page.
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.q}>📞 How do I contact support?</Text>
        <Text style={styles.a}>
          You can reach us via WhatsApp, email, or call from the Support page.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  block: { marginBottom: 16 },
  q: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  a: { fontSize: 15, color: "#555", lineHeight: 20 },
});
