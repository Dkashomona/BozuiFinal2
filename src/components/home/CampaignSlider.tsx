/*
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

  /** Load USER wishlist *
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

  /** Toggle wishlist *
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

  /** Load campaigns + all campaign products *
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

  /** Reset slider *
  useEffect(() => {
    if (campaigns.length === 0) return;
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [campaigns.length]);

  /** Auto-scroll *
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
              {/* Banner *
              <View style={styles.bannerWrapper}>
                <Image
                  source={{ uri: c.bannerImage }}
                  style={styles.banner}
                />

                <View style={styles.campaignLabel}>
                  <Text style={styles.campaignLabelText}>{c.title}</Text>
                </View>
              </View>

              {/* Products under banner *
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10, paddingHorizontal: 10 }}
              >
                {(campaignProducts[c.id] ?? []).map((p) => {
                  const discount = applyDiscounts(p, campaigns);

                  return (
                    <View key={p.id} style={styles.productCard}>
                      {/* Heart *
                      <TouchableOpacity
                        onPress={() => toggleWishlist(p.id)}
                        style={styles.productHeart}
                      >
                        <Heart active={wishlist[p.id]} />
                      </TouchableOpacity>

                      {/* SALE badge *
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

                      {/* Price *
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

      {/* Dots *
      <View style={styles.dots}>
        {campaigns.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { opacity: i === activeIndex ? 1 : 0.3 }]}
          />
        ))}
      </View>

      {/* Modal *
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
*/
/* FULL FIXED CAMPAIGN SLIDER — MATCHES ID FILTERING */

import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
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
const bannerHeight = width > 900 ? 260 : 120;

function Heart({ active }: { active: boolean }) {
  return <Text style={{ fontSize: 20 }}>{active ? "❤️" : "🤍"}</Text>;
}

type CampaignSliderProps = {
  query?: string;
  category?: string; // categoryId
  subcategory?: string; // subcategoryId
  min?: number | null;
  max?: number | null;
  sort?: string;
};

export default function CampaignSlider({
  query = "",
  category = "All",
  subcategory = "All",
  min = null,
  max = null,
  sort = "none",
}: CampaignSliderProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignProducts, setCampaignProducts] = useState<
    Record<string, any[]>
  >({});
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  const scrollRef = useRef<ScrollView>(null);

  /* ------------ Wishlist ------------ */

  async function loadWishlist() {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDoc(doc(db, "users", user.uid));

    if (snap.exists()) {
      const list = snap.data().wishlist ?? [];
      const map: Record<string, boolean> = {};
      list.forEach((id: string) => (map[id] = true));
      setWishlist(map);
    }
  }

  async function toggleWishlist(productId: string) {
    const user = auth.currentUser;
    if (!user) return alert("Log in first");

    const ref = doc(db, "users", user.uid);
    const active = wishlist[productId];

    setWishlist((prev) => ({ ...prev, [productId]: !active }));

    await updateDoc(ref, {
      wishlist: active ? arrayRemove(productId) : arrayUnion(productId),
    });
  }

  /* ------------ Load Campaigns + Products ------------ */

  const load = useCallback(async () => {
    const data = await getCampaigns();
    setCampaigns(data);
    await loadWishlist();

    const map: Record<string, any[]> = {};

    for (const c of data) {
      const list: any[] = [];
      const ids = c.productIds ?? [];

      for (const pid of ids) {
        const snap = await getDoc(doc(db, "products", pid));
        if (snap.exists()) list.push({ id: pid, ...snap.data() });
      }

      map[c.id] = list;
    }

    setCampaignProducts(map);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ------------ Filtering ------------ */

  const filterProduct = (p: any) => {
    if (!p) return false;

    if (!p.name.toLowerCase().includes(query.toLowerCase())) return false;

    if (category !== "All" && p.categoryId !== category) return false;

    if (subcategory !== "All" && p.subcategoryId !== subcategory) return false;

    if (min !== null && Number(p.price) < min) return false;

    if (max !== null && Number(p.price) > max) return false;

    return true;
  };

  const filteredProducts = Object.fromEntries(
    Object.entries(campaignProducts).map(([cid, list]) => {
      let items = list.filter(filterProduct);

      // Sorting
      if (sort === "price_low")
        items = [...items].sort((a, b) => a.price - b.price);
      if (sort === "price_high")
        items = [...items].sort((a, b) => b.price - a.price);
      if (sort === "name_asc")
        items = [...items].sort((a, b) => a.name.localeCompare(b.name));
      if (sort === "name_desc")
        items = [...items].sort((a, b) => b.name.localeCompare(a.name));

      return [cid, items];
    })
  );

  const visibleCampaigns = campaigns.filter(
    (c) => (filteredProducts[c.id] ?? []).length > 0
  );

  /* ------------ Auto-scroll ------------ */

  useEffect(() => {
    if (paused || visibleCampaigns.length <= 1) return;

    const timeout = setTimeout(() => {
      const next = (activeIndex + 1) % visibleCampaigns.length;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }, 4000);

    return () => clearTimeout(timeout);
  }, [activeIndex, paused, visibleCampaigns.length]);

  const hoverProps =
    Platform.OS === "web"
      ? {
          onMouseEnter: () => setPaused(true),
          onMouseLeave: () => setPaused(false),
        }
      : {};

  /* ------------ UI ------------ */

  if (visibleCampaigns.length === 0)
    return (
      <View style={{ paddingVertical: 20 }}>
        <Text style={{ textAlign: "center", fontSize: 16, opacity: 0.6 }}>
          No deals match your filters.
        </Text>
      </View>
    );

  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={styles.sectionTitle}>🔥 Featured Deals</Text>

      <View {...hoverProps}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(idx);
          }}
        >
          {visibleCampaigns.map((c) => (
            <Pressable
              key={c.id}
              style={{ width }}
              onPress={() => setSelectedCampaign(c)}
            >
              <View style={styles.bannerWrapper}>
                <Image source={{ uri: c.bannerImage }} style={styles.banner} />
                <View style={styles.campaignLabel}>
                  <Text style={styles.campaignLabelText}>{c.title}</Text>
                </View>
              </View>

              {/* Filtered Products */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 12, paddingHorizontal: 10 }}
              >
                {filteredProducts[c.id].map((p) => {
                  const discount = applyDiscounts(p, campaigns);

                  return (
                    <View key={p.id} style={styles.productCard}>
                      <TouchableOpacity
                        onPress={() => toggleWishlist(p.id)}
                        style={styles.productHeart}
                      >
                        <Heart active={wishlist[p.id]} />
                      </TouchableOpacity>

                      {discount.hasDiscount && (
                        <View style={styles.saleBadge}>
                          <Text style={styles.saleBadgeText}>
                            -{discount.discountPercent}%
                          </Text>
                        </View>
                      )}

                      <View style={styles.productImageWrapper}>
                        <Image
                          source={{ uri: p.images?.[0] }}
                          style={styles.productImage}
                        />
                      </View>

                      <Text numberOfLines={1} style={styles.productName}>
                        {p.name}
                      </Text>

                      {discount.hasDiscount ? (
                        <View style={styles.priceRow}>
                          <Text style={styles.oldPrice}>
                            ${discount.originalPrice}
                          </Text>
                          <Text style={styles.newPrice}>${discount.price}</Text>
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

      {/* DOTS */}
      <View style={styles.dots}>
        {visibleCampaigns.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { opacity: i === activeIndex ? 1 : 0.3 }]}
          />
        ))}
      </View>

      {/* MODAL */}
      <CampaignModal
        visible={!!selectedCampaign}
        campaign={selectedCampaign}
        products={
          selectedCampaign ? (filteredProducts[selectedCampaign.id] ?? []) : []
        }
        onClose={() => setSelectedCampaign(null)}
      />
    </View>
  );
}

/* ------------ STYLES ------------ */

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
    borderRadius: 14,
  },
  campaignLabel: {
    position: "absolute",
    bottom: 14,
    left: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  campaignLabelText: { color: "white", fontWeight: "800", fontSize: 15 },

  productCard: {
    width: 130,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 12,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: "relative",
  },

  productHeart: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 4,
    borderRadius: 20,
    zIndex: 20,
  },

  saleBadge: {
    position: "absolute",
    left: 8,
    top: 8,
    backgroundColor: "#e60023",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 20,
  },

  saleBadgeText: { color: "white", fontSize: 11, fontWeight: "700" },

  productImageWrapper: {
    width: "100%",
    height: 95,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },

  productImage: { width: "100%", height: "100%" },

  productName: { fontSize: 12, fontWeight: "600", color: "#333" },

  priceRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  oldPrice: {
    fontSize: 11,
    textDecorationLine: "line-through",
    color: "#777",
  },
  newPrice: { fontSize: 13, fontWeight: "900", color: "#e60023" },

  productPrice: { fontSize: 13, fontWeight: "700", color: "#111" },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  dot: {
    width: 7,
    height: 7,
    backgroundColor: "#333",
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
