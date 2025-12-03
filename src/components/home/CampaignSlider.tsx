import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Campaign } from "../../models/Campaign";
import { getCampaigns } from "../../services/campaignService";
import { db, auth } from "../../services/firebase";
import CampaignModal from "./CampaignModal";
import { applyDiscounts } from "../../utils/discountEngine";

const { width } = Dimensions.get("window");

// Banner sizes
const bannerHeight = Platform.OS === "web" || width > 900 ? 260 : 90;
// Product card sizes
const productImgSize = Platform.OS === "web" || width > 900 ? 120 : 85;

function Heart({ active }: { active: boolean }) {
  return <Text style={{ fontSize: 22 }}>{active ? "❤️" : "🤍"}</Text>;
}

export default function CampaignSlider() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignProducts, setCampaignProducts] = useState<Record<string, any[]>>({});
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  /** Load USER wishlist */
  async function loadWishlist() {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const list = snap.data().wishlist ?? [];
    const map: Record<string, boolean> = {};
    list.forEach((id: string) => (map[id] = true));
    setWishlist(map);
  }

  /** Toggle wishlist */
  async function toggleWishlist(productId: string) {
    const user = auth.currentUser;
    if (!user) return alert("Please log in first");

    const ref = doc(db, "users", user.uid);
    const isActive = wishlist[productId];

    setWishlist((prev) => ({ ...prev, [productId]: !isActive }));

    await updateDoc(ref, {
      wishlist: isActive ? arrayRemove(productId) : arrayUnion(productId),
    });
  }

  /** Load campaigns + all campaign products */
  const load = useCallback(async () => {
    const data = await getCampaigns();
    setCampaigns(data);
    await loadWishlist();

    const productMap: Record<string, any[]> = {};

    for (const c of data) {
      const list: any[] = [];
      const ids = Array.isArray(c.productIds) ? c.productIds : [];

      for (const pid of ids) {
        const ref = doc(db, "products", pid);
        const snap = await getDoc(ref);
        if (snap.exists()) list.push({ id: pid, ...snap.data() });
      }

      productMap[c.id] = list;
    }

    setCampaignProducts(productMap);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Reset slider */
  useEffect(() => {
    if (campaigns.length === 0) return;
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [campaigns.length]);

  /** Auto-scroll */
  useEffect(() => {
    if (campaigns.length <= 1 || paused) return;

    const timeout = setTimeout(() => {
      const next = (activeIndex + 1) % campaigns.length;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }, 4000);

    return () => clearTimeout(timeout);
  }, [activeIndex, paused, campaigns.length]);

  const hoverProps =
    Platform.OS === "web"
      ? {
          onMouseEnter: () => setPaused(true),
          onMouseLeave: () => setPaused(false),
        }
      : {};

  if (campaigns.length === 0) return null;

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.sectionTitle}>🔥 Featured Deals</Text>

      <View {...hoverProps}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(index);
          }}
        >
          {campaigns.map((c) => (
            <Pressable
              key={c.id}
              style={{ width }}
              onPress={() => setSelectedCampaign(c)}
            >
              {/* Banner */}
              <View style={styles.bannerWrapper}>
                <Image
                  source={{ uri: c.bannerImage }}
                  style={styles.banner}
                />

                <View style={styles.campaignLabel}>
                  <Text style={styles.campaignLabelText}>{c.title}</Text>
                </View>
              </View>

              {/* Products under banner */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10, paddingHorizontal: 10 }}
              >
                {(campaignProducts[c.id] ?? []).map((p) => {
                  const discount = applyDiscounts(p, campaigns);

                  return (
                    <View key={p.id} style={styles.productCard}>
                      {/* Heart */}
                      <TouchableOpacity
                        onPress={() => toggleWishlist(p.id)}
                        style={styles.productHeart}
                      >
                        <Heart active={wishlist[p.id]} />
                      </TouchableOpacity>

                      {/* SALE badge */}
                      {discount.hasDiscount && (
                        <View style={styles.saleBadge}>
                          <Text style={styles.saleBadgeText}>
                            -{discount.discountPercent}%
                          </Text>
                        </View>
                      )}

                      <Image
                        source={{ uri: p.images?.[0] }}
                        style={styles.productImage}
                      />

                      <Text numberOfLines={1} style={styles.productName}>
                        {p.name}
                      </Text>

                      {/* Price */}
                      {discount.hasDiscount ? (
                        <View style={{ flexDirection: "row", gap: 6 }}>
                          <Text style={styles.oldPrice}>
                            ${discount.originalPrice}
                          </Text>
                          <Text style={styles.newPrice}>
                            ${discount.price}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.productPrice}>${p.price}</Text>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Dots */}
      <View style={styles.dots}>
        {campaigns.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { opacity: i === activeIndex ? 1 : 0.3 }]}
          />
        ))}
      </View>

      {/* Modal */}
      <CampaignModal
        visible={!!selectedCampaign}
        campaign={selectedCampaign}
        products={selectedCampaign ? campaignProducts[selectedCampaign.id] ?? [] : []}
        onClose={() => setSelectedCampaign(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  bannerWrapper: { position: "relative" },
  banner: {
    width: "100%",
    height: bannerHeight,
    resizeMode: "cover",
    borderRadius: 12,
  },
  campaignLabel: {
    position: "absolute",
    bottom: 14,
    left: 14,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  campaignLabelText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  productCard: {
    width: productImgSize + 30,
    marginRight: 12,
    alignItems: "center",
    position: "relative",
  },

  productHeart: {
    position: "absolute",
    right: 4,
    top: 4,
    zIndex: 20,
  },

  saleBadge: {
    position: "absolute",
    left: 4,
    top: 4,
    backgroundColor: "#e74c3c",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 20,
  },

  saleBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },

  productImage: {
    width: productImgSize,
    height: productImgSize,
    borderRadius: 10,
    resizeMode: "cover",
    marginBottom: 6,
  },
  productName: { fontSize: 12, fontWeight: "600" },
  productPrice: { fontSize: 12, fontWeight: "600" },

  oldPrice: {
    fontSize: 11,
    textDecorationLine: "line-through",
    color: "#777",
  },
  newPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#e74c3c",
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    width: 7,
    height: 7,
    backgroundColor: "#333",
    borderRadius: 4,
    marginHorizontal: 3,
  },
});
