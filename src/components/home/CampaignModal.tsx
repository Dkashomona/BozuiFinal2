import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Campaign } from "../../models/Campaign";
import ProductQuickViewModal from "./ProductQuickViewModal";

type Product = {
  id: string;
  name: string;
  price?: number;
  images?: string[];
  [key: string]: any;
};

type Props = {
  visible: boolean;
  campaign: Campaign | null;
  products: Product[];
  onClose: () => void;
};

export default function CampaignModal({
  visible,
  campaign,
  products,
  onClose,
}: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { width } = useWindowDimensions();

  if (!campaign) return null;

  const isLarge = width > 600;
  const BANNER_HEIGHT = isLarge ? 320 : 220;

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* BACKDROP */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* MODAL */}
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* ================= BANNER ================= */}
          <View style={[styles.bannerWrap, { height: BANNER_HEIGHT }]}>
            {/* BACKGROUND FILL (premium, no crop) */}
            <Image
              source={{ uri: campaign.bannerImage }}
              style={styles.bannerBackground}
              resizeMode="cover"
              blurRadius={Platform.OS === "web" ? 0 : 14}
            />

            {/* MAIN IMAGE (NO CROPPING) */}
            <Image
              source={{ uri: campaign.bannerImage }}
              style={styles.bannerContain}
              resizeMode="contain"
            />

            {/* GRADIENT */}
            <View style={styles.bannerGradient} />

            {/* TEXT */}
            <View style={styles.bannerTextWrap}>
              <Text style={styles.campaignTitle}>{campaign.title}</Text>
              {!!campaign.subtitle && (
                <Text style={styles.campaignSubtitle}>{campaign.subtitle}</Text>
              )}
            </View>
          </View>

          {/* ================= PRODUCTS ================= */}
          <Text style={styles.sectionTitle}>Featured Products</Text>

          <View
            style={[
              styles.grid,
              { gridTemplateColumns: isLarge ? "1fr 1fr" : "1fr" },
            ]}
          >
            {products.map((p) => {
              const img =
                p.images?.[0] ??
                "https://via.placeholder.com/300x300?text=No+Image";

              return (
                <TouchableOpacity
                  key={p.id}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => setSelectedProduct(p)}
                >
                  {/* IMAGE */}
                  <View style={styles.cardImageWrap}>
                    <Image
                      source={{ uri: img }}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                  </View>

                  {/* DETAILS */}
                  <View style={styles.cardBody}>
                    <Text numberOfLines={1} style={styles.cardName}>
                      {p.name}
                    </Text>
                    <Text style={styles.cardPrice}>${p.price}</Text>
                  </View>

                  {/* VIEW */}
                  <TouchableOpacity
                    style={styles.cardViewBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/product/${p.id}`);
                      onClose();
                    }}
                  >
                    <Text style={styles.cardViewText}>View</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CLOSE */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* QUICK VIEW */}
        <ProductQuickViewModal
          visible={!!selectedProduct}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onViewFull={() => {
            if (selectedProduct) {
              router.push(`/product/${selectedProduct.id}`);
              setSelectedProduct(null);
              onClose();
            }
          }}
        />
      </View>
    </Modal>
  );
}

/* =====================================================
   STYLES
===================================================== */
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  container: {
    position: "absolute",
    top: "4%",
    left: "3%",
    right: "3%",
    bottom: "4%",
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
  },

  scrollContent: {
    paddingBottom: 80,
  },

  /* ================= BANNER ================= */
  bannerWrap: {
    position: "relative",
    backgroundColor: "#111",
    overflow: "hidden",
  },

  bannerBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.35,
  },

  bannerContain: {
    width: "100%",
    height: "100%",
  },

  bannerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  bannerTextWrap: {
    position: "absolute",
    bottom: 28,
    left: 24,
    right: 24,
  },

  campaignTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
  },

  campaignSubtitle: {
    marginTop: 6,
    fontSize: 16,
    color: "#eee",
  },

  /* ================= GRID ================= */
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
  },

  grid: {
    display: "grid",
    gap: 16,
    paddingHorizontal: 16,
  } as any,

  /* ================= CARD ================= */
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    ...(Platform.OS === "web" && { cursor: "pointer" }),
  },

  cardImageWrap: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f6f6f6",
    alignItems: "center",
    justifyContent: "center",
  },

  cardImage: {
    width: "88%",
    height: "88%",
  },

  cardBody: {
    padding: 12,
  },

  cardName: {
    fontSize: 15,
    fontWeight: "600",
  },

  cardPrice: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "700",
    color: "#e67e22",
  },

  cardViewBtn: {
    margin: 12,
    backgroundColor: "#000",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  cardViewText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  closeBtn: {
    marginTop: 25,
    padding: 14,
    alignSelf: "center",
    backgroundColor: "#222",
    borderRadius: 10,
    width: "60%",
    alignItems: "center",
  },

  closeBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
