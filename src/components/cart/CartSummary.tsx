import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect, useMemo } from "react";
import {
  applyItemDiscount,
  applyCartDiscount,
} from "../../utils/discountEngine";
import { db } from "../../services/firebase";
import { doc, onSnapshot, getDocs, collection } from "firebase/firestore";
import { calculateTax } from "../../services/taxService";

type CartItem = {
  id: string;
  price: number;
  qty: number;
  weight?: number;
};

export default function CartSummary({ items, campaigns, userData, zip }: any) {
  const [config, setConfig] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [shipping, setShipping] = useState(0);
  const [promoInput, setPromoInput] = useState("");

  /* ---------------- CONFIG ---------------- */
  useEffect(() => {
    return onSnapshot(doc(db, "settings", "cartConfig"), (snap) => {
      if (snap.exists()) setConfig(snap.data());
    });
  }, []);

  /* ---------------- ZONES ---------------- */
  useEffect(() => {
    async function loadZones() {
      const snap = await getDocs(collection(db, "shipping_zones"));
      setZones(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    loadZones();
  }, []);

  /* ---------------- CART TOTALS ---------------- */
  const { subtotal, discount, total } = useMemo(() => {
    let subtotal = 0;
    let discountedSubtotal = 0;

    for (const item of items) {
      const result = applyItemDiscount({
        item,
        qty: item.qty,
        campaigns,
        userData,
      });

      subtotal += item.price * item.qty;
      discountedSubtotal += result.price * item.qty;
    }

    const finalTotal = applyCartDiscount({
      subtotal: discountedSubtotal,
      campaigns,
      userData,
    });

    return {
      subtotal,
      discount: subtotal - finalTotal,
      total: finalTotal,
    };
  }, [items, campaigns, userData]);

  /* ---------------- WEIGHT ---------------- */
  const totalWeight = useMemo<number>(
    () =>
      items.reduce((w: number, i: CartItem) => w + (i.weight ?? 0) * i.qty, 0),
    [items]
  );

  /* ---------------- TAX ---------------- */
  const tax = useMemo(() => {
    if (!config) return 0;
    return calculateTax(total, config.defaultRegion) ?? 0;
  }, [config, total]);

  /* ---------------- SHIPPING ---------------- */
  useEffect(() => {
    if (!config) return;

    if (subtotal >= Number(config.freeShippingThreshold || 999999)) {
      setShipping(0);
      return;
    }

    const prefix = zip?.substring(0, 2);
    const zone = zones.find(
      (z) =>
        z.countries.includes(prefix) &&
        totalWeight >= (z.minWeight || 0) &&
        totalWeight <= (z.maxWeight || 999999)
    );

    setShipping(Number(zone?.price ?? config.defaultShippingPrice ?? 0));
  }, [zip, zones, totalWeight, subtotal, config]);

  const grandTotal = useMemo(
    () => total + tax + shipping,
    [total, tax, shipping]
  );

  /* ---------------- PROMO ---------------- */
  const tryApplyPromo = () => {
    const promo = config?.activePromos?.[promoInput];
    if (!promo) return alert("Invalid promo code");

    alert("Promo applied");
  };

  if (!config) {
    return (
      <View style={styles.box}>
        <Text>Loading cart configuration…</Text>
      </View>
    );
  }

  return (
    <View style={styles.box}>
      <Text style={styles.row}>Subtotal: ${subtotal.toFixed(2)}</Text>

      {discount > 0 && (
        <Text style={styles.saved}>You saved ${discount.toFixed(2)} 🎉</Text>
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
