import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { Campaign } from "../../models/Campaign";
import { getCampaigns } from "../../services/campaignService";
import { db, auth } from "../../services/firebase";
import CampaignModal from "./CampaignModal";

/* --------------------------------------------------
   TYPES
-------------------------------------------------- */
type CampaignSliderProps = {
  query?: string;
  category?: string;
  subcategory?: string;
  min?: number | null;
  max?: number | null;
};

function Heart({ active }: { active: boolean }) {
  return <Text style={{ fontSize: 18 }}>{active ? "❤️" : "🤍"}</Text>;
}

/* --------------------------------------------------
   COMPONENT
-------------------------------------------------- */
export default function CampaignSlider({
  query = "",
  category = "All",
  subcategory = "All",
  min = null,
  max = null,
}: CampaignSliderProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const bannerHeight = width > 900 ? 260 : 140;
  const CARD_WIDTH = isDesktop ? 170 : 130;

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
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<ScrollView>(null);

  /* --------------------------------------------------
     FILTER
  -------------------------------------------------- */
  const filterProduct = (p: any) => {
    if (!p) return false;
    if (query && !p.name?.toLowerCase().includes(query.toLowerCase()))
      return false;
    if (category !== "All" && p.categoryId !== category) return false;
    if (subcategory !== "All" && p.subcategoryId !== subcategory) return false;
    if (min !== null && Number(p.price) < min) return false;
    if (max !== null && Number(p.price) > max) return false;
    return true;
  };

  /* --------------------------------------------------
     WISHLIST
  -------------------------------------------------- */
  async function loadWishlist() {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;

    const list: string[] = snap.data().wishlist ?? [];
    const map: Record<string, boolean> = {};
    list.forEach((id) => (map[id] = true));
    setWishlist(map);
  }

  async function toggleWishlist(productId: string) {
    const user = auth.currentUser;
    if (!user) return alert("Please log in first");

    const ref = doc(db, "users", user.uid);
    const active = wishlist[productId];

    setWishlist((prev) => ({ ...prev, [productId]: !active }));

    await updateDoc(ref, {
      wishlist: active ? arrayRemove(productId) : arrayUnion(productId),
    });
  }

  /* --------------------------------------------------
     LOAD CAMPAIGNS + PRODUCTS
  -------------------------------------------------- */
  const load = useCallback(async () => {
    setLoading(true);

    const data = await getCampaigns();
    setCampaigns(data);
    await loadWishlist();

    const map: Record<string, any[]> = {};

    for (const c of data) {
      const list: any[] = [];
      for (const pid of c.productIds ?? []) {
        const snap = await getDoc(doc(db, "products", pid));
        if (snap.exists()) list.push({ id: pid, ...snap.data() });
      }
      map[c.id] = list;
    }

    setCampaignProducts(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* --------------------------------------------------
     AUTO SCROLL
  -------------------------------------------------- */
  useEffect(() => {
    if (paused || campaigns.length <= 1) return;

    const t = setTimeout(() => {
      const next = (activeIndex + 1) % campaigns.length;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }, 4000);

    return () => clearTimeout(t);
  }, [activeIndex, paused, campaigns.length, width]);

  const hoverProps =
    Platform.OS === "web"
      ? {
          onMouseEnter: () => setPaused(true),
          onMouseLeave: () => setPaused(false),
        }
      : {};

  /* --------------------------------------------------
     LOADING
  -------------------------------------------------- */
  if (loading) {
    return (
      <ScrollView horizontal style={{ paddingHorizontal: 12 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={[styles.skeletonCard, { width: CARD_WIDTH }]} />
        ))}
      </ScrollView>
    );
  }

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
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
          {campaigns
            .filter((c) => (campaignProducts[c.id] ?? []).some(filterProduct))
            .map((c) => (
              <Pressable
                key={c.id}
                style={{ width }}
                onPress={() => setSelectedCampaign(c)}
              >
                {/* BANNER */}
                <View style={[styles.bannerWrap, { height: bannerHeight }]}>
                  <Image
                    source={{ uri: c.bannerImage }}
                    style={styles.bannerBackground}
                    resizeMode="cover"
                  />
                  <View style={styles.bannerOverlay} />
                  <Text style={styles.bannerTitle}>{c.title}</Text>
                </View>

                {/* PRODUCTS */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {campaignProducts[c.id]?.filter(filterProduct).map((p) => (
                    <View
                      key={p.id}
                      style={[styles.productCard, { width: CARD_WIDTH }]}
                    >
                      <TouchableOpacity
                        style={styles.productHeart}
                        onPress={() => toggleWishlist(p.id)}
                      >
                        <Heart active={wishlist[p.id]} />
                      </TouchableOpacity>

                      <Image
                        source={{ uri: p.images?.[0] }}
                        style={styles.productImage}
                        resizeMode="contain"
                      />

                      <Text numberOfLines={1} style={styles.productName}>
                        {p.name}
                      </Text>

                      <Text style={styles.productPrice}>
                        ${Number(p.price).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </Pressable>
            ))}
        </ScrollView>
      </View>

      {/* MODAL */}
      <CampaignModal
        visible={!!selectedCampaign}
        campaign={selectedCampaign}
        products={
          selectedCampaign ? (campaignProducts[selectedCampaign.id] ?? []) : []
        }
        onClose={() => setSelectedCampaign(null)}
      />
    </View>
  );
}

/* --------------------------------------------------
   STYLES
-------------------------------------------------- */
const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  bannerWrap: { borderRadius: 14, overflow: "hidden", backgroundColor: "#111" },
  bannerBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  bannerTitle: {
    position: "absolute",
    bottom: 16,
    left: 16,
    color: "white",
    fontSize: 20,
    fontWeight: "800",
  },
  productCard: {
    marginRight: 12,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  productHeart: { position: "absolute", top: 8, right: 8 },
  productImage: { width: "100%", height: 90 },
  productName: { fontSize: 12, fontWeight: "600" },
  productPrice: { fontSize: 13, fontWeight: "700" },
  skeletonCard: {
    height: 180,
    borderRadius: 12,
    backgroundColor: "#eaeaea",
    marginRight: 12,
  },
});
