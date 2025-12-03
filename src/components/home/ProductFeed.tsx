import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { db, auth } from "../../services/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import ProductQuickViewModal from "./ProductQuickViewModal";
import { router } from "expo-router";
import { getCampaigns } from "../../services/campaignService";

type Product = {
  id: string;
  name: string;
  price?: number;
  images?: string[];
};

function HeartIcon({ active }: { active: boolean }) {
  return <Text style={{ fontSize: 22 }}>{active ? "❤️" : "🤍"}</Text>;
}

export default function ProductFeed({ isWeb = false }: { isWeb?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [campaignProductIds, setCampaignProductIds] = useState<Set<string>>(new Set());

  const { width } = useWindowDimensions();
  const numColumns = width < 500 ? 2 : width < 900 ? 3 : 5;

  useEffect(() => {
    async function loadAll() {
      // Load campaigns only to know which products to hide
      const campaignList = await getCampaigns();

      const used = new Set<string>();
      campaignList.forEach((c) => {
        (c.productIds ?? []).forEach((pid: string) => used.add(pid));
      });
      setCampaignProductIds(used);

      await loadProducts();
      await loadWishlist();
    }
    loadAll();
  }, []);

  async function loadProducts() {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
  }

  async function loadWishlist() {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const list = snap.data()?.wishlist ?? [];
      const map: Record<string, boolean> = {};
      list.forEach((pid: string) => (map[pid] = true));
      setWishlist(map);
    }
  }

  async function toggleWishlist(productId: string) {
    const user = auth.currentUser;
    if (!user) return alert("Log in first");

    const ref = doc(db, "users", user.uid);
    const isActive = wishlist[productId];

    setWishlist((prev) => ({ ...prev, [productId]: !isActive }));

    await updateDoc(ref, {
      wishlist: isActive ? arrayRemove(productId) : arrayUnion(productId),
    });
  }

  function renderCard(item: Product, cardWidth: number) {
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.card, { width: cardWidth }]}
        onPress={() => setQuickViewProduct(item)}
      >
        {/* Wishlist */}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => toggleWishlist(item.id)}
        >
          <HeartIcon active={wishlist[item.id]} />
        </TouchableOpacity>

        <Image
          source={{ uri: item.images?.[0] }}
          style={styles.image}
        />

        <Text numberOfLines={1} style={styles.name}>
          {item.name}
        </Text>

        <Text style={styles.price}>${item.price}</Text>
      </TouchableOpacity>
    );
  }

  // WEB
  if (isWeb) {
    const cardWidth = Math.min(width / numColumns - 20, 260);

    return (
      <ScrollView contentContainerStyle={styles.webGrid}>
        {products
          .filter((p) => !campaignProductIds.has(p.id))  // << KEEP FILTER
          .map((item) => renderCard(item, cardWidth))}

        <ProductQuickViewModal
          visible={!!quickViewProduct}
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onViewFull={() => {
            if (quickViewProduct) router.push(`/product/${quickViewProduct.id}`);
          }}
        />
      </ScrollView>
    );
  }

  // MOBILE
  return (
    <>
      <FlatList
        data={products.filter((p) => !campaignProductIds.has(p.id))} // << KEEP FILTER
        renderItem={({ item }) =>
          renderCard(item, width / numColumns - 20)
        }
        numColumns={numColumns}
        key={numColumns}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ justifyContent: "flex-start" }}
        showsVerticalScrollIndicator={false}
      />

      <ProductQuickViewModal
        visible={!!quickViewProduct}
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewFull={() => {
          if (quickViewProduct) router.push(`/product/${quickViewProduct.id}`);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 6,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    elevation: 1,
    position: "relative",
  },
  webGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    gap: 16,
  },

  heartButton: {
    position: "absolute",
    right: 8,
    top: 8,
    zIndex: 30,
  },

  image: {
    width: "100%",
    aspectRatio: 1.1,
    borderRadius: 8,
    marginBottom: 6,
  },

  name: { fontSize: 12, fontWeight: "600" },

  price: { fontSize: 12, fontWeight: "600" },
});
