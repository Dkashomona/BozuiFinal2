import React, { useEffect, useState } from "react";
import CartButton from "../cart/CartButton";

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { getCampaigns } from "../../services/campaignService";
import { router } from "expo-router";
import ProductQuickViewModal from "./ProductQuickViewModal";

export default function CampaignSectionList() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignProducts, setCampaignProducts] = useState<
    Record<string, any[]>
  >({});
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const { width } = useWindowDimensions();
  const CARD_WIDTH = width * 0.4;

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getCampaigns();
    setCampaigns(data);

    const map: Record<string, any[]> = {};
    for (const c of data) {
      const list: any[] = [];
      for (const pid of c.productIds || []) {
        const snap = await getDoc(doc(db, "products", pid));
        if (snap.exists()) {
          list.push({ id: pid, ...snap.data() });
        }
      }
      map[c.id] = list;
    }
    setCampaignProducts(map);
  }

  return (
    <View>
      {campaigns.map((c) => (
        <View key={c.id} style={{ marginTop: 20 }}>
          <Text style={styles.title}>{c.title}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(campaignProducts[c.id] || []).map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.card, { width: CARD_WIDTH }]}
                onPress={() => setQuickViewProduct(p)}
              >
                <Image
                  source={{
                    uri: p.images?.[0] ?? "https://via.placeholder.com/150",
                  }}
                  style={styles.image}
                />
                <Text numberOfLines={2} style={styles.name}>
                  {p.name}
                </Text>
                <Text style={styles.price}>${p.price}</Text>

                {/* 🔥 Modular Cart Button */}
                <CartButton product={p} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}

      {/* 🔥 Quick View Modal Integration */}
      <ProductQuickViewModal
        visible={!!quickViewProduct}
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewFull={() => {
          if (quickViewProduct) {
            router.push({
              pathname: "/product/[id]",
              params: { id: quickViewProduct.id },
            });
            setQuickViewProduct(null);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginRight: 12,
    elevation: 2,
    shadowColor: "#0003",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 6,
    resizeMode: "cover",
  },
  name: { fontSize: 14, fontWeight: "500" },
  price: { color: "#e67e22", fontWeight: "bold", marginTop: 4 },
});
