import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { db } from "../../../src/services/firebase";
import { doc, updateDoc, setDoc, onSnapshot } from "firebase/firestore";

export default function CartSettingsScreen() {
  const [config, setConfig] = useState<any>(null);

  // MAIN SETTINGS
  const [defaultRegion, setDefaultRegion] = useState("");
  const [defaultShippingPrice, setDefaultShippingPrice] = useState("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");

  // PROMO MANAGEMENT
  const [selectedPromo, setSelectedPromo] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoType, setPromoType] = useState("PERCENT");
  const [promoValue, setPromoValue] = useState("");
  const [maxUserInput, setMaxUserInput] = useState("");
  const [maxTotalInput, setMaxTotalInput] = useState("");

  /* ---------------------------------------------------
        LIVE FIRESTORE SYNC
  --------------------------------------------------- */
  useEffect(() => {
    const ref = doc(db, "settings", "cartConfig");

    const unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        // FIRST TIME SETUP
        const defaults = {
          defaultRegion: "KY",
          defaultShippingPrice: 0,
          freeShippingThreshold: 75,
          promoText: "Spend ${{missing}} more to unlock ${{reward}} OFF!",
          unlockedText: "🎉 You unlocked ${{reward}} OFF!",
          activePromos: {},
        };
        await setDoc(ref, defaults);
        setConfig(defaults);
        return;
      }

      const data = snap.data();
      setConfig(data);

      setDefaultRegion(data.defaultRegion ?? "KY");
      setDefaultShippingPrice(String(data.defaultShippingPrice ?? "0"));
      setFreeShippingThreshold(String(data.freeShippingThreshold ?? "75"));
    });

    return unsub;
  }, []);

  if (!config) return <Text style={{ padding: 20 }}>Loading…</Text>;

  /* ---------------------------------------------------
        SAVE MAIN SETTINGS
  --------------------------------------------------- */
  const saveSettings = async () => {
    const updated = {
      ...config,
      defaultRegion,
      defaultShippingPrice: Number(defaultShippingPrice),
      freeShippingThreshold: Number(freeShippingThreshold),
    };

    try {
      await updateDoc(doc(db, "settings", "cartConfig"), updated);
      Alert.alert("Saved", "Main settings updated!");
    } catch {
      Alert.alert("Error", "Could not save.");
    }
  };

  /* ---------------------------------------------------
        SELECT PROMO TO EDIT
  --------------------------------------------------- */
  const selectExistingPromo = (code: string) => {
    const promo = config.activePromos[code];

    setSelectedPromo(code);
    setPromoCode(code);
    setPromoType(promo.type);
    setPromoValue(
      promo.type === "PERCENT" ? String(promo.percent) : String(promo.amount)
    );
    setMaxUserInput(String(promo.maxUsagePerUser ?? ""));
    setMaxTotalInput(String(promo.maxTotalUses ?? ""));
  };

  /* ---------------------------------------------------
        SAVE PROMO
  --------------------------------------------------- */
  const savePromo = async () => {
    if (!promoCode || !promoValue) {
      return Alert.alert("Error", "Fill all promo fields.");
    }

    const updatedPromos = {
      ...config.activePromos,
      [promoCode]: {
        type: promoType,
        ...(promoType === "PERCENT"
          ? { percent: Number(promoValue) }
          : { amount: Number(promoValue) }),
        maxUsagePerUser: Number(maxUserInput) || null,
        maxTotalUses: Number(maxTotalInput) || null,
        currentUses: selectedPromo
          ? (config.activePromos[promoCode].currentUses ?? 0)
          : 0,
      },
    };

    const updated = { ...config, activePromos: updatedPromos };

    try {
      await updateDoc(doc(db, "settings", "cartConfig"), updated);
      Alert.alert(selectedPromo ? "Promo Updated" : "Promo Added");
    } catch {
      Alert.alert("Error", "Could not save promo.");
    }

    setConfig(updated);
    resetPromoForm();
  };

  const resetPromoForm = () => {
    setSelectedPromo(null);
    setPromoCode("");
    setPromoType("PERCENT");
    setPromoValue("");
    setMaxUserInput("");
    setMaxTotalInput("");
  };

  /* ---------------------------------------------------
        DELETE PROMO
  --------------------------------------------------- */
  const deletePromo = async (code: string) => {
    const updated = { ...config.activePromos };
    delete updated[code];

    const newConfig = { ...config, activePromos: updated };

    await updateDoc(doc(db, "settings", "cartConfig"), newConfig);

    setConfig(newConfig);
    if (selectedPromo === code) resetPromoForm();
  };

  /* ---------------------------------------------------
        UI
  --------------------------------------------------- */
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cart & Shipping Settings</Text>

      {/* REGION */}
      <Text style={styles.label}>Default Region</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. KY"
        value={defaultRegion}
        onChangeText={setDefaultRegion}
      />

      {/* DEFAULT SHIPPING PRICE */}
      <Text style={styles.label}>Default Shipping Price ($)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={defaultShippingPrice}
        onChangeText={setDefaultShippingPrice}
      />

      {/* FREE SHIPPING */}
      <Text style={styles.label}>Free Shipping Threshold ($)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={freeShippingThreshold}
        onChangeText={setFreeShippingThreshold}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
        <Text style={styles.saveText}>Save Settings</Text>
      </TouchableOpacity>

      {/* PROMO LIST */}
      <Text style={styles.section}>Promo Codes</Text>

      {Object.keys(config.activePromos).map((code) => (
        <TouchableOpacity
          key={code}
          style={[
            styles.promoItem,
            selectedPromo === code && styles.promoSelected,
          ]}
          onPress={() => selectExistingPromo(code)}
        >
          <Text style={styles.promoLabel}>
            {code} —{" "}
            {config.activePromos[code].type === "PERCENT"
              ? `${config.activePromos[code].percent}%`
              : `$${config.activePromos[code].amount} OFF`}
          </Text>

          <TouchableOpacity onPress={() => deletePromo(code)}>
            <Text style={{ color: "red" }}>Delete</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {/* CREATE/EDIT PROMO */}
      <Text style={styles.section}>
        {selectedPromo ? "Edit Promo" : "Add New Promo"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Promo Code"
        value={promoCode}
        onChangeText={setPromoCode}
      />

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.typeBtn, promoType === "PERCENT" && styles.selected]}
          onPress={() => setPromoType("PERCENT")}
        >
          <Text>Percent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeBtn, promoType === "FIXED" && styles.selected]}
          onPress={() => setPromoType("FIXED")}
        >
          <Text>Fixed Amount</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder={promoType === "PERCENT" ? "10%" : "5$ OFF"}
        value={promoValue}
        onChangeText={setPromoValue}
      />

      <Text style={styles.subLabel}>Max Usage Per User</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={maxUserInput}
        onChangeText={setMaxUserInput}
      />

      <Text style={styles.subLabel}>Max Total Uses</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={maxTotalInput}
        onChangeText={setMaxTotalInput}
      />

      <TouchableOpacity style={styles.addBtn} onPress={savePromo}>
        <Text style={styles.saveText}>
          {selectedPromo ? "Update Promo" : "Add Promo"}
        </Text>
      </TouchableOpacity>

      {selectedPromo && (
        <TouchableOpacity style={styles.resetBtn} onPress={resetPromoForm}>
          <Text style={{ color: "#555" }}>Cancel Edit</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 150 }} />
    </ScrollView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "white" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, marginTop: 15, fontWeight: "700" },
  subLabel: { marginTop: 12, color: "#666" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  saveBtn: {
    backgroundColor: "#27ae60",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  addBtn: {
    backgroundColor: "#3498db",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  resetBtn: { marginTop: 10, alignSelf: "center" },
  saveText: { color: "white", fontWeight: "700", fontSize: 16 },
  section: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 10,
  },
  promoItem: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  promoSelected: { backgroundColor: "#e8f7ff", borderColor: "#3ca0e0" },
  promoLabel: { fontWeight: "700" },
  row: { flexDirection: "row", marginTop: 6 },
  typeBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginRight: 10,
  },
  selected: { backgroundColor: "#d1f7ff", borderColor: "#00a0c8" },
});
