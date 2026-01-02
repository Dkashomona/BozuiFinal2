import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import AdminHeader from "../../../src/components/admin/AdminHeader";
import ProductMultiSelect from "../../../src/components/admin/ProductMultiSelect";
import { createCampaign } from "../../../src/services/campaignService";
import { uploadImageAsync } from "../../../src/services/uploadService";
import { pickImage } from "../../../src/utils/pickImage";

/* --------------------------------------------------
   CAMPAIGN TYPES
-------------------------------------------------- */
const CAMPAIGN_TYPES = [
  { label: "Buy X Get %", value: "BUY_X_GET_Y_PERCENT", color: "#6C5CE7" },
  { label: "First Order", value: "FIRST_PURCHASE_DISCOUNT", color: "#00B894" },
  { label: "Spend & Save", value: "SPEND_AND_SAVE", color: "#0984E3" },
  { label: "BOGO", value: "BOGO", color: "#E84393" },
  { label: "Flash Sale", value: "FLASH_SALE", color: "#D63031" },
  { label: "Quantity", value: "QUANTITY_DISCOUNT", color: "#FDCB6E" },
];

export default function AddCampaignPage() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [type, setType] = useState<string | null>(null);
  const [config, setConfig] = useState<any>({});

  async function chooseBanner() {
    const uri = await pickImage();
    if (uri) setBanner(uri);
  }

  async function save() {
    if (!title.trim()) return alert("Enter a campaign title");
    if (!banner) return alert("Pick a banner image");
    if (!type) return alert("Select a campaign type");

    // ✅ REQUIRED: product selection validation
    if (
      type !== "SPEND_AND_SAVE" &&
      type !== "FIRST_PURCHASE_DISCOUNT" &&
      productIds.length === 0
    ) {
      return alert("Select at least one product for this campaign");
    }

    const id = Date.now().toString();

    const bannerUrl = await uploadImageAsync(
      banner,
      `campaigns/${id}/banner.jpg`
    );

    const numericConfig = Object.fromEntries(
      Object.entries(config).map(([k, v]) => [
        k,
        v === "" || v == null ? undefined : Number(v),
      ])
    );

    await createCampaign(
      id,
      {
        title,
        subtitle,
        productIds,
        type,

        // ✅ REQUIRED FOR DISCOUNT ENGINE
        scope:
          type === "SPEND_AND_SAVE" || type === "FIRST_PURCHASE_DISCOUNT"
            ? "cart"
            : "item",

        active: true,
        priority: 10,

        config: numericConfig,
      },
      bannerUrl
    );

    router.push("/admin/campaigns");
  }

  const Content = (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* DETAILS */}
      <Section title="Campaign Details">
        <Label>Title</Label>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="Black Friday Sale"
        />

        <Label>Subtitle</Label>
        <TextInput
          value={subtitle}
          onChangeText={setSubtitle}
          style={styles.input}
          placeholder="Up to 50% OFF"
        />
      </Section>

      {/* BANNER */}
      <Section title="Banner">
        <TouchableOpacity style={styles.bannerBtn} onPress={chooseBanner}>
          <Text style={styles.bannerBtnText}>
            {banner ? "Change Banner" : "Pick Banner Image"}
          </Text>
        </TouchableOpacity>

        {banner && (
          <View style={styles.bannerPreviewWrap}>
            <Image
              source={{ uri: banner }}
              style={styles.bannerPreview}
              resizeMode={Platform.OS === "web" ? "cover" : "contain"}
            />
          </View>
        )}
      </Section>

      {/* PRODUCTS */}
      <Section title="Products">
        <ProductMultiSelect selected={productIds} onChange={setProductIds} />
      </Section>

      {/* CAMPAIGN TYPE */}
      <Section title="Campaign Type">
        <View style={styles.typeGrid}>
          {CAMPAIGN_TYPES.map((t) => {
            const active = type === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                onPress={() => {
                  setType(t.value);
                  setConfig({});
                }}
                style={[
                  styles.typePill,
                  { backgroundColor: active ? t.color : "#f1f2f6" },
                ]}
              >
                <Text
                  style={[styles.typePillText, active && { color: "#fff" }]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      {/* RULES */}
      {type && (
        <Section title="Campaign Rules">
          <DynamicFields type={type} config={config} setConfig={setConfig} />
        </Section>
      )}

      {/* SAVE */}
      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveText}>Create Campaign</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <AdminHeader title="Create Campaign" backTo="/admin" />

      <View style={styles.topActions}>
        <TouchableOpacity
          onPress={() => router.push("/admin/campaigns")}
          style={styles.secondaryBtn}
        >
          <Text style={styles.secondaryBtnText}>📋 View Campaigns</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === "web" ? (
        Content
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {Content}
        </TouchableWithoutFeedback>
      )}
    </KeyboardAvoidingView>
  );
}

/* --------------------------------------------------
   RULE INPUT (LOCAL STATE)
-------------------------------------------------- */
function RuleInput({
  label,
  value,
  onCommit,
}: {
  label: string;
  value?: string;
  onCommit: (v: string) => void;
}) {
  const [local, setLocal] = useState(value ?? "");

  useEffect(() => {
    setLocal(value ?? "");
  }, [value]);

  return (
    <>
      <Label>{label}</Label>
      <TextInput
        style={styles.input}
        value={local}
        onChangeText={setLocal}
        onBlur={() => onCommit(local)}
      />
    </>
  );
}

/* --------------------------------------------------
   DYNAMIC RULES
-------------------------------------------------- */
function DynamicFields({ type, config, setConfig }: any) {
  const commit = (key: string, val: string) =>
    setConfig((prev: any) => ({ ...prev, [key]: val }));

  switch (type) {
    case "BUY_X_GET_Y_PERCENT":
      return (
        <>
          <RuleInput
            label="Buy Quantity"
            value={config.buyQuantity}
            onCommit={(v) => commit("buyQuantity", v)}
          />
          <RuleInput
            label="Discount %"
            value={config.discountPercent}
            onCommit={(v) => commit("discountPercent", v)}
          />
        </>
      );

    case "FIRST_PURCHASE_DISCOUNT":
      return (
        <RuleInput
          label="Discount %"
          value={config.discountPercent}
          onCommit={(v) => commit("discountPercent", v)}
        />
      );

    case "SPEND_AND_SAVE":
      return (
        <>
          <RuleInput
            label="Minimum Spend ($)"
            value={config.minAmount}
            onCommit={(v) => commit("minAmount", v)}
          />
          <RuleInput
            label="Discount ($)"
            value={config.discountAmount}
            onCommit={(v) => commit("discountAmount", v)}
          />
        </>
      );

    case "BOGO":
      return (
        <>
          <RuleInput
            label="Buy X"
            value={config.buy}
            onCommit={(v) => commit("buy", v)}
          />
          <RuleInput
            label="Get Y Free"
            value={config.getFree}
            onCommit={(v) => commit("getFree", v)}
          />
        </>
      );

    case "FLASH_SALE":
      return (
        <>
          <RuleInput
            label="Discount %"
            value={config.discountPercent}
            onCommit={(v) => commit("discountPercent", v)}
          />
          <RuleInput
            label="Start Timestamp"
            value={config.startAt}
            onCommit={(v) => commit("startAt", v)}
          />
          <RuleInput
            label="End Timestamp"
            value={config.endAt}
            onCommit={(v) => commit("endAt", v)}
          />
        </>
      );

    case "QUANTITY_DISCOUNT":
      return (
        <>
          <RuleInput
            label="Min Quantity"
            value={config.minQuantity}
            onCommit={(v) => commit("minQuantity", v)}
          />
          <RuleInput
            label="Discount %"
            value={config.discountPercent}
            onCommit={(v) => commit("discountPercent", v)}
          />
        </>
      );

    default:
      return null;
  }
}

/* --------------------------------------------------
   UI HELPERS
-------------------------------------------------- */
function Section({ title, children }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Label({ children }: any) {
  return <Text style={styles.label}>{children}</Text>;
}

/* --------------------------------------------------
   STYLES
-------------------------------------------------- */
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f4f6f8" },
  content: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "600", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    backgroundColor: "#fafafa",
  },
  bannerBtn: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  topActions: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  secondaryBtn: {
    backgroundColor: "#1E90FF",
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },

  bannerBtnText: { color: "#fff", fontWeight: "800" },
  bannerPreviewWrap: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: "#fff",
    overflow: "hidden",
    // IMPORTANT
    width: "100%",
    height: Platform.OS === "web" ? 260 : 180,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerPreview: { width: "100%", height: Platform.OS === "web" ? 220 : 180 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  typePill: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999 },
  typePillText: { fontSize: 13, fontWeight: "800", color: "#111" },
  saveBtn: {
    marginTop: 12,
    backgroundColor: "#0F172A",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "900" },
});
