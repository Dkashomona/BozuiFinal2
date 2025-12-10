/*

import React, { useEffect, useState, useMemo } from "react";
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
  category?: string;
  subcategory?: string;
  images?: string[];
};

function HeartIcon({ active }: { active: boolean }) {
  return <Text style={{ fontSize: 22 }}>{active ? "❤️" : "🤍"}</Text>;
}

type Props = {
  isWeb?: boolean;
  query?: string;
  category?: string;
  subcategory?: string;
  min?: number | null;
  max?: number | null;
};

export default function ProductFeed({
  isWeb = false,
  query = "",
  category = "All",
  subcategory = "All",
  min = null,
  max = null,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [campaignProductIds, setCampaignProductIds] = useState<Set<string>>(
    new Set()
  );

  const { width } = useWindowDimensions();
  const numColumns = width < 500 ? 2 : width < 900 ? 3 : 5;

  /* ---------------------------------------------------------
     LOAD PRODUCTS + CAMPAIGNS + WISHLIST
  --------------------------------------------------------- 
  useEffect(() => {
    async function loadAll() {
      // Load campaign products to hide
      const campaignList = await getCampaigns();
      const used = new Set<string>();

      campaignList.forEach((c: any) => {
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
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product));
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

  /* ---------------------------------------------------------
     𝗙𝗜𝗡𝗔𝗟 𝗙𝗜𝗟𝗧𝗘𝗥𝗘𝗗 𝗣𝗥𝗢𝗗𝗨𝗖𝗧𝗦  
     Works with Query + Category + Subcategory + Price Range
  --------------------------------------------------------- 
  const filteredProducts = useMemo(() => {
    return (
      products
        .filter((p) => !campaignProductIds.has(p.id)) // remove campaign products

        // SEARCH
        .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))

        // CATEGORY
        .filter((p) => (category === "All" ? true : p.category === category))

        // SUBCATEGORY
        .filter((p) =>
          subcategory === "All" ? true : p.subcategory === subcategory
        )

        // MIN PRICE
        .filter((p) => (min !== null ? Number(p.price) >= min : true))

        // MAX PRICE
        .filter((p) => (max !== null ? Number(p.price) <= max : true))
    );
  }, [products, query, category, subcategory, min, max, campaignProductIds]);

  /* ---------------------------------------------------------
     CARD COMPONENT
  --------------------------------------------------------- 
  function renderCard(item: Product, cardWidth: number) {
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.card, { width: cardWidth }]}
        onPress={() => setQuickViewProduct(item)}
      >
        {/* Wishlist *
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => toggleWishlist(item.id)}
        >
          <HeartIcon active={wishlist[item.id]} />
        </TouchableOpacity>

        <Image source={{ uri: item.images?.[0] }} style={styles.image} />

        <Text numberOfLines={1} style={styles.name}>
          {item.name}
        </Text>

        <Text style={styles.price}>${item.price}</Text>
      </TouchableOpacity>
    );
  }

  /* ---------------------------------------------------------
     WEB GRID
  --------------------------------------------------------- 
  if (isWeb) {
    const cardWidth = Math.min(width / numColumns - 20, 260);

    return (
      <ScrollView contentContainerStyle={styles.webGrid}>
        {filteredProducts.map((item) => renderCard(item, cardWidth))}

        <ProductQuickViewModal
          visible={!!quickViewProduct}
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onViewFull={() => {
            if (quickViewProduct) {
              router.push(`/product/${quickViewProduct.id}`);
            }
          }}
        />
      </ScrollView>
    );
  }

  /* ---------------------------------------------------------
     MOBILE GRID
  --------------------------------------------------------- 
  return (
    <>
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => renderCard(item, width / numColumns - 20)}
        numColumns={numColumns}
        key={numColumns}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />

      <ProductQuickViewModal
        visible={!!quickViewProduct}
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewFull={() => {
          if (quickViewProduct) {
            router.push(`/product/${quickViewProduct.id}`);
          }
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
*/
import React, { useEffect, useState, useMemo } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  View,
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
  categoryId?: string;
  subcategoryId?: string;
  price?: number;
  images?: string[];
};

function HeartIcon({ active }: { active: boolean }) {
  return <Text style={{ fontSize: 20 }}>{active ? "❤️" : "🤍"}</Text>;
}

type Props = {
  isWeb?: boolean;
  query?: string;
  category?: string; // categoryId
  subcategory?: string; // subcategoryId
  min?: number | null;
  max?: number | null;
  sort?: string;
};

export default function ProductFeed({
  isWeb = false,
  query = "",
  category = "All",
  subcategory = "All",
  min = null,
  max = null,
  sort = "none",
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [campaignProductIds, setCampaignProductIds] = useState<Set<string>>(
    new Set()
  );

  const { width } = useWindowDimensions();
  const numColumns = width < 500 ? 2 : width < 900 ? 3 : 5;

  /** LOAD PRODUCTS + WISHLIST + CAMPAIGNS **/
  useEffect(() => {
    async function loadAll() {
      const campaigns = await getCampaigns();
      const used = new Set<string>();

      campaigns.forEach((c: any) => {
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
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product));
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
    const active = wishlist[productId];

    setWishlist((prev) => ({ ...prev, [productId]: !active }));

    await updateDoc(ref, {
      wishlist: active ? arrayRemove(productId) : arrayUnion(productId),
    });
  }

  /** FILTERS */
  const filteredProducts = useMemo(() => {
    let results = products
      .filter((p) => !campaignProductIds.has(p.id))
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      .filter((p) => (category === "All" ? true : p.categoryId === category))
      .filter((p) =>
        subcategory === "All" ? true : p.subcategoryId === subcategory
      )
      .filter((p) => (min !== null ? Number(p.price) >= min : true))
      .filter((p) => (max !== null ? Number(p.price) <= max : true));

    // Sorting
    if (sort === "price_low") {
      results = [...results].sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (sort === "price_high") {
      results = [...results].sort((a, b) => Number(b.price) - Number(a.price));
    }
    if (sort === "name_asc") {
      results = [...results].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sort === "name_desc") {
      results = [...results].sort((a, b) => b.name.localeCompare(a.name));
    }

    return results;
  }, [
    products,
    query,
    category,
    subcategory,
    min,
    max,
    sort,
    campaignProductIds,
  ]);

  /** PRODUCT CARD */
  function renderCard(item: Product, cardWidth: number) {
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.card, { width: cardWidth }]}
        onPress={() => setQuickViewProduct(item)}
        activeOpacity={0.8}
      >
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => toggleWishlist(item.id)}
        >
          <HeartIcon active={wishlist[item.id]} />
        </TouchableOpacity>

        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.images?.[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <Text numberOfLines={2} style={styles.name}>
          {item.name}
        </Text>
        <Text style={styles.price}>${item.price}</Text>
      </TouchableOpacity>
    );
  }

  /** WEB VERSION **/
  if (isWeb) {
    const cardWidth = Math.min(width / numColumns - 20, 260);

    return (
      <ScrollView contentContainerStyle={styles.webGrid}>
        {filteredProducts.map((p) => renderCard(p, cardWidth))}

        <ProductQuickViewModal
          visible={!!quickViewProduct}
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onViewFull={() =>
            quickViewProduct && router.push(`/product/${quickViewProduct.id}`)
          }
        />
      </ScrollView>
    );
  }

  /** MOBILE VERSION **/
  return (
    <>
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => renderCard(item, width / numColumns - 20)}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />

      <ProductQuickViewModal
        visible={!!quickViewProduct}
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewFull={() =>
          quickViewProduct && router.push(`/product/${quickViewProduct.id}`)
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    position: "relative",
  },
  heartButton: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 50,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 4,
    borderRadius: 18,
  },
  imageWrapper: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    backgroundColor: "#f6f6f6",
    overflow: "hidden",
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  price: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
  },
  webGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    gap: 16,
  },
});
