import { View, Text, StyleSheet } from "react-native";

export default function SuccessScreen() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>🎉 Order Successful!</Text>
      <Text>Your payment has been processed.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 10 },
});
