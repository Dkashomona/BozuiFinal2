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

  const [thresholdInput, setThresholdInput] = useState("");
  const [rewardInput, setRewardInput] = useState("");

  const [selectedPromo, setSelectedPromo] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoType, setPromoType] = useState("PERCENT");
  const [promoValue, setPromoValue] = useState("");

  const [maxUserInput, setMaxUserInput] = useState("");
  const [maxTotalInput, setMaxTotalInput] = useState("");

  /* ---------------------------------------------------
      REAL-TIME FIRESTORE SYNC
  --------------------------------------------------- */
  useEffect(() => {
    const ref = doc(db, "settings", "cartConfig");

    const unsubscribe = onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setConfig(data);

        setThresholdInput(String(data.spendThreshold ?? ""));
        setRewardInput(String(data.rewardAmount ?? ""));
      } else {
        const defaults = {
          spendThreshold: 100,
          rewardAmount: 15,
          promoText: "Spend ${{missing}} more to unlock ${{reward}} OFF!",
          unlockedText: "🎉 You unlocked ${{reward}} OFF!",
          activePromos: {},
        };
        await setDoc(ref, defaults);
        setConfig(defaults);
      }
    });

    return unsubscribe;
  }, []);

  if (!config) return <Text style={{ padding: 20 }}>Loading…</Text>;

  /* ---------------------------------------------------
      SAVE MAIN SETTINGS
  --------------------------------------------------- */
  const saveSettings = async () => {
    const threshold = Number(thresholdInput);
    const reward = Number(rewardInput);

    if (isNaN(threshold) || isNaN(reward)) {
      return Alert.alert("Error", "Threshold & Reward must be valid numbers.");
    }

    const updated = {
      ...config,
      spendThreshold: threshold,
      rewardAmount: reward,
    };

    try {
      await updateDoc(doc(db, "settings", "cartConfig"), updated);
      Alert.alert("Saved", "Settings updated!");
    } catch {
      Alert.alert("Error", "Could not save settings.");
    }
  };

  /* ---------------------------------------------------
      SELECT EXISTING PROMO
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
      ADD / UPDATE PROMO
  --------------------------------------------------- */
  const savePromo = async () => {
    if (!promoCode || !promoValue) {
      return Alert.alert("Error", "Fill promo fields.");
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
          ? config.activePromos[promoCode].currentUses ?? 0
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

    try {
      await updateDoc(doc(db, "settings", "cartConfig"), newConfig);
    } catch {
      Alert.alert("Error", "Could not delete promo.");
    }

    setConfig(newConfig);
    if (selectedPromo === code) resetPromoForm();
  };

  /* ---------------------------------------------------
      UI
  --------------------------------------------------- */
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cart Settings</Text>

      {/* Spend Threshold */}
      <Text style={styles.label}>Spend Threshold ($)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={thresholdInput}
        onChangeText={setThresholdInput}
      />

      {/* Reward */}
      <Text style={styles.label}>Reward Amount ($)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={rewardInput}
        onChangeText={setRewardInput}
      />

      {/* Promo Text */}
      <Text style={styles.label}>Promo Text</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        multiline
        value={config.promoText}
        onChangeText={(v) => setConfig({ ...config, promoText: v })}
      />

      {/* Unlocked Text */}
      <Text style={styles.label}>Unlocked Text</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        multiline
        value={config.unlockedText}
        onChangeText={(v) => setConfig({ ...config, unlockedText: v })}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
        <Text style={styles.saveText}>Save Settings</Text>
      </TouchableOpacity>

      {/* PROMO LIST */}
      <Text style={styles.section}>Promo Codes</Text>

      {Object.keys(config.activePromos).length === 0 && (
        <Text style={{ color: "#777", marginTop: 10 }}>No promo codes yet.</Text>
      )}

      {Object.entries(config.activePromos).map(([code, promo]: any) => (
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
            {promo.type === "PERCENT"
              ? `${promo.percent}%`
              : `$${promo.amount} OFF`}
            {"\n"}
            <Text style={{ fontSize: 12, color: "#777" }}>
              Used: {promo.currentUses ?? 0} / {promo.maxTotalUses ?? "∞"}
            </Text>
          </Text>

          <TouchableOpacity onPress={() => deletePromo(code)}>
            <Text style={{ color: "red" }}>Delete</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {/* ADD / EDIT PROMO */}
      <Text style={styles.section}>
        {selectedPromo ? "Edit Promo" : "Add New Promo"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Promo Code"
        value={promoCode}
        onChangeText={setPromoCode}
      />

      <Text style={styles.subLabel}>Promo Type</Text>
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
          <Text>Fixed</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder={promoType === "PERCENT" ? "10%" : "5$ OFF"}
        keyboardType="numeric"
        value={promoValue}
        onChangeText={setPromoValue}
      />

      {/* MAX USAGE PER USER */}
      <Text style={styles.subLabel}>Max Usage Per User</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 1"
        keyboardType="numeric"
        value={maxUserInput}
        onChangeText={setMaxUserInput}
      />

      {/* MAX TOTAL USES */}
      <Text style={styles.subLabel}>Max Total Uses (Store-wide)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 100"
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

/* ---------------------------------------------------
      STYLES
--------------------------------------------------- */
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
  textArea: { height: 90, textAlignVertical: "top" },
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
  promoSelected: {
    backgroundColor: "#e8f7ff",
    borderColor: "#3ca0e0",
  },
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
