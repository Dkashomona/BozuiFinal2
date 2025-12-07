import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect, useMemo } from "react";
import { applyDiscounts } from "../../utils/discountEngine";
import { db } from "../../services/firebase";
import { doc, onSnapshot, getDocs, collection } from "firebase/firestore";
import { calculateTax } from "../../services/taxService";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  weight?: number;
};

export interface CartSummaryProps {
  items: CartItem[];
  campaigns: any[];
  userData: any;
  zip?: string;
}

export default function CartSummary({
  items,
  campaigns,
  userData,
  zip,
}: CartSummaryProps) {
  /* ----------------------------- STATE ----------------------------- */
  const [config, setConfig] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [shipping, setShipping] = useState<number>(0);
  const [promoInput, setPromoInput] = useState("");
  const [coupon, setCoupon] = useState<any>(null);

  /* -------------------- LOAD CART CONFIG -------------------- */
  useEffect(() => {
    return onSnapshot(doc(db, "settings", "cartConfig"), (snap) => {
      if (snap.exists()) setConfig(snap.data());
    });
  }, []);

  /* -------------------- LOAD SHIPPING ZONES -------------------- */
  useEffect(() => {
    async function loadZones() {
      const snap = await getDocs(collection(db, "shipping_zones"));
      const arr: any[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setZones(arr);
    }
    loadZones();
  }, []);

  /* -------------------- ALWAYS-CALL HOOKS -------------------- */

  // Subtotal
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.price) * Number(i.qty), 0),
    [items]
  );

  // Weight
  const totalWeight = useMemo(
    () => items.reduce((w, i) => w + (i.weight ?? 0) * i.qty, 0),
    [items]
  );

  // Discounts
  const { totalPrice, totalDiscount } = useMemo(() => {
    let final = 0;
    let saved = 0;

    for (const item of items) {
      const d = applyDiscounts(
        item,
        campaigns,
        userData,
        item.qty,
        coupon,
        subtotal
      );

      const original = d.originalPrice * item.qty;
      const newPrice = d.price * item.qty;

      final += newPrice;
      saved += original - newPrice;
    }

    return { totalPrice: final, totalDiscount: saved };
  }, [items, campaigns, userData, coupon, subtotal]);

  // Tax placeholder (safe even if config is null)
  const tax = useMemo(() => {
    if (!config) return 0;
    return calculateTax(totalPrice, config.defaultRegion) ?? 0;
  }, [config, totalPrice]);

  // Shipping logic
  useEffect(() => {
    if (!config) return;
    if (!zip || zip.length < 4) {
      setShipping(Number(config.defaultShippingPrice || 0));
      return;
    }

    const prefix = zip.substring(0, 2);
    const zone = zones.find(
      (z) =>
        z.countries.includes(prefix) &&
        totalWeight >= (z.minWeight || 0) &&
        totalWeight <= (z.maxWeight || 999999)
    );

    if (subtotal >= Number(config.freeShippingThreshold || 999999)) {
      setShipping(0);
    } else {
      setShipping(Number(zone?.price ?? config.defaultShippingPrice ?? 0));
    }
  }, [zip, zones, totalWeight, subtotal, config]);

  // Grand Total (safe)
  const grandTotal = useMemo(() => {
    return (totalPrice || 0) + (tax || 0) + Number(shipping || 0);
  }, [totalPrice, tax, shipping]);

  /* -------------------- EARLY-UI RETURN (SAFE AFTER HOOKS) -------------------- */
  if (!config) {
    return (
      <View style={styles.box}>
        <Text>Loading cart configuration…</Text>
      </View>
    );
  }

  /* ----------------------------- RENDER UI ----------------------------- */
  const tryApplyPromo = () => {
    const promo = config.activePromos?.[promoInput];
    if (!promo) return alert("Invalid promo");

    const used = userData?.promoUsage?.[promoInput] ?? 0;

    if (promo.maxUsagePerUser && used >= promo.maxUsagePerUser)
      return alert("Usage limit reached.");

    if (promo.maxTotalUses && promo.currentUses >= promo.maxTotalUses)
      return alert("Promo expired.");

    setCoupon(promo);
    alert("Promo applied!");
  };

  return (
    <View style={styles.box}>
      <Text style={styles.row}>Subtotal: ${subtotal.toFixed(2)}</Text>

      {totalDiscount > 0 && (
        <Text style={styles.saved}>
          You saved ${totalDiscount.toFixed(2)} 🎉
        </Text>
      )}

      <View style={styles.promoRow}>
        <TextInput
          placeholder="Promo code"
          style={styles.input}
          value={promoInput}
          onChangeText={setPromoInput}
        />
        <TouchableOpacity style={styles.btn} onPress={tryApplyPromo}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Apply</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.row}>
        Shipping: {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
      </Text>

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
    marginBottom: 20,
  },
  row: { fontSize: 16, marginTop: 6 },
  saved: { color: "#27ae60", fontWeight: "700", marginTop: 4 },
  promoRow: { flexDirection: "row", marginTop: 12, gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
  },
  btn: {
    backgroundColor: "#e67e22",
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 8,
  },
  total: { fontSize: 22, fontWeight: "800", marginTop: 16 },
});
