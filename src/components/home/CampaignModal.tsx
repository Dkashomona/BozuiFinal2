import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Campaign } from "../../models/Campaign";
import ProductQuickViewModal from "./ProductQuickViewModal";

export default function CampaignModal({
  visible,
  campaign,
  products,
  onClose,
}: {
  visible: boolean;
  campaign: Campaign | null;
  products: any[];
  onClose: () => void;
}) {

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  if (!campaign) return null;

  return (
    <Modal animationType="fade" visible={visible} transparent>
      {/* Dim background */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          
          {/* Banner */}
          {campaign.bannerImage ? (
            <Image
              source={{ uri: campaign.bannerImage }}
              style={styles.banner}
            />
          ) : (
            <View style={[styles.banner, styles.bannerPlaceholder]}>
              <Text>No Banner</Text>
            </View>
          )}

          <Text style={styles.title}>{campaign.title}</Text>

          {campaign.subtitle ? (
            <Text style={styles.subtitle}>{campaign.subtitle}</Text>
          ) : null}

          <Text style={styles.sectionTitle}>Products in this campaign</Text>

          {products.length === 0 && (
            <Text style={{ color: "#777" }}>No products in this campaign.</Text>
          )}

          {products.map((p) => {
            const img = p.images?.[0] || null;

            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSelectedProduct(p)}
                style={styles.productRow}
              >
                {img ? (
                  <Image source={{ uri: img }} style={styles.productImage} />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Text style={{ color: "#777", fontSize: 10 }}>No image</Text>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{p.name}</Text>
                  {"price" in p && (
                    <Text style={styles.productPrice}>${p.price}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Quick View Modal */}
        <ProductQuickViewModal
          visible={!!selectedProduct}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onViewFull={() =>
            console.log("Open full product:", selectedProduct?.id)
          }
        />

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    position: "absolute",
    top: "8%",
    left: "5%",
    right: "5%",
    bottom: "5%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
  },
  banner: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    resizeMode: "cover",
  },
  bannerPlaceholder: {
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
  productRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
    gap: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
  },
  productPrice: {
    fontSize: 14,
    color: "#e67e22",
    fontWeight: "bold",
  },
  closeBtn: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#333",
    borderRadius: 10,
    alignItems: "center",
  },
  closeText: {
    color: "white",
    fontWeight: "bold",
  },
});
