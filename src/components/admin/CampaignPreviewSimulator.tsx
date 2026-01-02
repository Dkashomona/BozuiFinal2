import { View, Text, StyleSheet } from "react-native";
import {
  applyItemDiscount,
  applyCartDiscount,
} from "../../utils/discountEngine";

export default function CampaignPreviewSimulator({
  item,
  qty,
  campaigns,
  userData,
}: any) {
  const itemResult = applyItemDiscount({
    item,
    qty,
    campaigns,
    userData,
  });

  const subtotal = itemResult.price * qty;

  const finalTotal = applyCartDiscount({
    subtotal,
    campaigns,
    userData,
  });

  return (
    <View style={styles.box}>
      <Text style={styles.title}>🧪 Discount Simulator</Text>

      <Text>Original: ${item.price}</Text>

      {itemResult.hasDiscount ? (
        <>
          <Text style={styles.green}>
            Item Discount: {itemResult.campaign?.title}
          </Text>
          <Text>Discounted: ${itemResult.price.toFixed(2)}</Text>
        </>
      ) : (
        <Text>No item discount</Text>
      )}

      <Text style={{ marginTop: 6 }}>Cart Total: ${finalTotal.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  title: {
    fontWeight: "800",
    marginBottom: 6,
  },
  green: {
    color: "#2ecc71",
    fontWeight: "700",
  },
});
