import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useState, useMemo, useEffect } from "react";
import { applyDiscounts } from "../../utils/discountEngine";
import { db } from "../../services/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import type { DeliveryKey } from "../../services/deliveryService";
import { DELIVERY_OPTIONS } from "../../services/deliveryService";
import { calculateTax } from "../../services/taxService";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type Campaign = {
  id: string;
  title: string;
  type: string;
  productIds?: string[];
  config?: any;
};

type Props = {
  items: CartItem[];
  campaigns: Campaign[];
  userData: any;
  region: string;
  delivery: DeliveryKey;   // strict union type
};

export default function CartSummary({
  items,
  campaigns,
  userData,
  region,
  delivery,
}: Props) {
  const [promoInput, setPromoInput] = useState("");
  const [coupon, setCoupon] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  /** Load admin config */
  useEffect(() => {
    const ref = doc(db, "settings", "cartConfig");
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) setConfig(snap.data());
    });
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  /** Total discount + total price */
  const { totalPrice, totalDiscount } = useMemo(() => {
    if (!config) return { totalPrice: subtotal, totalDiscount: 0 };

    let finalTotal = 0;
    let finalDiscount = 0;

    for (const item of items) {
      const discount = applyDiscounts(
        item,
        campaigns,
        userData,
        item.qty,
        coupon,
        subtotal
      );

      const itemOriginal = discount.originalPrice * item.qty;
      const itemFinal = discount.price * item.qty;

      finalTotal += itemFinal;
      finalDiscount += itemOriginal - itemFinal;
    }

    return { totalPrice: finalTotal, totalDiscount: finalDiscount };
  }, [items, campaigns, userData, coupon, subtotal, config]);

  if (!config) {
    return (
      <View style={styles.box}>
        <Text>Loading…</Text>
      </View>
    );
  }

  /** Spend more logic */
  const threshold = Number(config.spendThreshold) || 100;
  const reward = Number(config.rewardAmount) || 15;
  const missing = Math.max(0, threshold - subtotal);

  const promoMsg =
    config.promoText
      ?.replace("{{missing}}", missing.toFixed(2))
      ?.replace("{{reward}}", `${reward}`)
      ?.replace("{{threshold}}", `${threshold}`)
      ?.replace("{{subtotal}}", `${subtotal}`) ?? "";

  const unlockedMsg =
    config.unlockedText?.replace("{{reward}}", `${reward}`) ?? "";

  /** Shipping */
  const shipping = DELIVERY_OPTIONS[delivery].amount;

  /** Tax */
  const tax = calculateTax(totalPrice, region);

  /** Promo application */
  const promoMap = config.activePromos || {};

  const tryApplyPromo = () => {
    const code = promoInput.trim();
    const promo = promoMap[code];

    if (!promo) return alert("Invalid code");

    const used = userData?.promoUsage?.[code] ?? 0;

    if (promo.maxUsagePerUser && used >= promo.maxUsagePerUser)
      return alert("You reached your usage limit.");

    if (promo.maxTotalUses && promo.currentUses >= promo.maxTotalUses)
      return alert("This promo is finished.");

    setCoupon(promo);
    alert("Promo Applied!");
  };

  /** GRAND TOTAL */
  const grandTotal = totalPrice + tax + shipping;

  return (
    <View style={styles.box}>
      <Text style={styles.label}>Subtotal: ${subtotal.toFixed(2)}</Text>

      {totalDiscount > 0 && (
        <Text style={styles.saved}>
          🎉 You saved ${totalDiscount.toFixed(2)}!
        </Text>
      )}

      {missing > 0 ? (
        <Text style={styles.spendMore}>{promoMsg}</Text>
      ) : (
        <Text style={styles.unlocked}>{unlockedMsg}</Text>
      )}

      {/* Promo */}
      <View style={styles.promoRow}>
        <TextInput
          value={promoInput}
          onChangeText={setPromoInput}
          placeholder="Promo code"
          style={styles.input}
        />
        <TouchableOpacity style={styles.btn} onPress={tryApplyPromo}>
          <Text style={{ color: "#fff" }}>Apply</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.row}>Shipping: ${shipping.toFixed(2)}</Text>
      <Text style={styles.row}>Tax: ${tax.toFixed(2)}</Text>

      <Text style={styles.total}>Total: ${grandTotal.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  label: { fontSize: 16, fontWeight: "600" },
  saved: { color: "#27ae60", marginTop: 4, fontWeight: "600" },
  spendMore: { color: "#e67e22", marginTop: 6 },
  unlocked: { color: "#27ae60", marginTop: 6, fontWeight: "600" },
  row: { marginTop: 8, fontSize: 15 },
  promoRow: { flexDirection: "row", marginTop: 12, gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
  },
  btn: {
    backgroundColor: "#e67e22",
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRadius: 8,
  },
  total: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
  },
});
