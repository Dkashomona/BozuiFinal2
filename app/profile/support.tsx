import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { router } from "expo-router";

export default function SupportScreen() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Need Help?</Text>
      <Text style={styles.subtitle}>We're here for you.</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => Linking.openURL("mailto:support@bozuishop.com")}
      >
        <Text style={styles.cardText}>📧 Email Support</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => Linking.openURL("https://wa.me/1234567890")}
      >
        <Text style={styles.cardText}>💬 WhatsApp Support</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/profile/faq")}
      >
        <Text style={styles.cardText}>📘 Frequently Asked Questions</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, backgroundColor: "#fff", flex: 1 },

  title: { fontSize: 28, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 16, color: "#777", marginBottom: 20 },

  card: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginBottom: 12,
  },

  cardText: { fontSize: 18, fontWeight: "600" },
});
