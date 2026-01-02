/*

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  FlatList,
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

import ProductCard from "../home/ProductCard";
import { router } from "expo-router";
import { getCampaigns } from "../../services/campaignService";

/* ----------------------------------------------------
   TYPES
---------------------------------------------------- 
export type Product = {
  id: string;
  name: string;
  categoryId?: string;
  subcategoryId?: string;
  price?: number;
  images?: string[];
};

type ProductFeedProps = {
  isWeb?: boolean;
  query?: string;
  category?: string;
  subcategory?: string;
  min?: number | null;
  max?: number | null;
  sort?: string;
};

/* ----------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------- 
export default function ProductFeed({
  isWeb = false,
  query = "",
  category = "All",
  subcategory = "All",
  min = null,
  max = null,
  sort = "none",
}: ProductFeedProps) {
  const { width } = useWindowDimensions();
  const numColumns = width < 500 ? 2 : width < 900 ? 3 : 5;

  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [campaignProductIds, setCampaignProductIds] = useState<Set<string>>(
    new Set()
  );

  /* ----------------------------------------------------
     LOAD PRODUCTS
  ---------------------------------------------------- 
  const loadProducts = useCallback(async () => {
    const snap = await getDocs(collection(db, "products"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
    setProducts(list);
  }, []);

  /* ----------------------------------------------------
     LOAD CAMPAIGNS
  ---------------------------------------------------- 
  const loadCampaigns = useCallback(async () => {
    const campaigns = await getCampaigns();
    const used = new Set<string>();

    campaigns.forEach((c: any) =>
      (c.productIds ?? []).forEach((pid: string) => used.add(pid))
    );

    setCampaignProductIds(used);
  }, []);

  useEffect(() => {
    loadProducts();
    loadCampaigns();
  }, [loadProducts, loadCampaigns]);

  /* ----------------------------------------------------
     LOAD WISHLIST
  ---------------------------------------------------- 
  const loadWishlist = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  /* ----------------------------------------------------
     TOGGLE WISHLIST
  ---------------------------------------------------- 
  const toggleWishlist = useCallback(
    async (productId: string) => {
      const user = auth.currentUser;
      if (!user) return alert("Please log in.");

      const active = wishlist[productId];

      setWishlist((prev) => ({
        ...prev,
        [productId]: !active,
      }));

      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, {
        wishlist: active ? arrayRemove(productId) : arrayUnion(productId),
      });
    },
    [wishlist]
  );

  /* ----------------------------------------------------
     FILTER + SORT
  ---------------------------------------------------- 
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => !campaignProductIds.has(p.id));

    if (query) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (category !== "All") {
      list = list.filter((p) => p.categoryId === category);
    }

    if (subcategory !== "All") {
      list = list.filter((p) => p.subcategoryId === subcategory);
    }

    if (min !== null) {
      list = list.filter((p) => Number(p.price) >= min);
    }

    if (max !== null) {
      list = list.filter((p) => Number(p.price) <= max);
    }

    switch (sort) {
      case "price_low":
        return [...list].sort((a, b) => Number(a.price) - Number(b.price));
      case "price_high":
        return [...list].sort((a, b) => Number(b.price) - Number(a.price));
      case "name_asc":
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        return [...list].sort((a, b) => b.name.localeCompare(a.name));
      default:
        return list;
    }
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

  /* ----------------------------------------------------
     RENDER
  ---------------------------------------------------- 
  const cardWidth = width / numColumns - 20;

  if (isWeb) {
    return (
      <ScrollView contentContainerStyle={styles.webGrid}>
        {filteredProducts.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            width={cardWidth}
            wishlist={wishlist[p.id] || false}
            onToggleWishlist={() => toggleWishlist(p.id)}
            onOpen={() => router.push(`/product/${p.id}`)}
          />
        ))}
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={filteredProducts}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          width={cardWidth}
          wishlist={wishlist[item.id] || false}
          onToggleWishlist={() => toggleWishlist(item.id)}
          onOpen={() => router.push(`/product/${item.id}`)}
        />
      )}
      numColumns={numColumns}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
    />
  );
}

/* ----------------------------------------------------
   STYLES
---------------------------------------------------- 
const styles = StyleSheet.create({
  webGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    padding: 12,
  },
});
*/

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  View,
  Platform,
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

import ProductCard from "../home/ProductCard";
import { router } from "expo-router";
import { getCampaigns } from "../../services/campaignService";

/* ----------------------------------------------------
   TYPES
---------------------------------------------------- */
export type Product = {
  id: string;
  name: string;
  categoryId?: string;
  subcategoryId?: string;
  price?: number;
  images?: string[];
};

type ProductFeedProps = {
  query?: string;
  category?: string;
  subcategory?: string;
  min?: number | null;
  max?: number | null;
  sort?: string;
};

/* ----------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------- */
export default function ProductFeed({
  query = "",
  category = "All",
  subcategory = "All",
  min = null,
  max = null,
  sort = "none",
}: ProductFeedProps) {
  const { width } = useWindowDimensions();

  /* ----------------------------------------------------
     RESPONSIVE BREAKPOINTS (WEB + NATIVE)
  ---------------------------------------------------- */
  const isPhone = width < 500;
  const isTablet = width >= 500 && width < 900;

  const numColumns = isPhone ? 2 : isTablet ? 3 : 5;

  const cardWidth =
    Platform.OS === "web"
      ? undefined // 🔥 flex controls width on web
      : Math.floor(width / numColumns) - 20;

  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [campaignProductIds, setCampaignProductIds] = useState<Set<string>>(
    new Set()
  );

  /* ----------------------------------------------------
     LOAD PRODUCTS
  ---------------------------------------------------- */
  const loadProducts = useCallback(async () => {
    const snap = await getDocs(collection(db, "products"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
    setProducts(list);
  }, []);

  /* ----------------------------------------------------
     LOAD CAMPAIGNS
  ---------------------------------------------------- */
  const loadCampaigns = useCallback(async () => {
    const campaigns = await getCampaigns();
    const used = new Set<string>();

    campaigns.forEach((c: any) =>
      (c.productIds ?? []).forEach((pid: string) => used.add(pid))
    );

    setCampaignProductIds(used);
  }, []);

  useEffect(() => {
    loadProducts();
    loadCampaigns();
  }, [loadProducts, loadCampaigns]);

  /* ----------------------------------------------------
     LOAD WISHLIST
  ---------------------------------------------------- */
  const loadWishlist = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  /* ----------------------------------------------------
     TOGGLE WISHLIST
  ---------------------------------------------------- */
  const toggleWishlist = useCallback(
    async (productId: string) => {
      const user = auth.currentUser;
      if (!user) return alert("Please log in.");

      const active = wishlist[productId];

      setWishlist((prev) => ({
        ...prev,
        [productId]: !active,
      }));

      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, {
        wishlist: active ? arrayRemove(productId) : arrayUnion(productId),
      });
    },
    [wishlist]
  );

  /* ----------------------------------------------------
     FILTER + SORT
  ---------------------------------------------------- */
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => !campaignProductIds.has(p.id));

    if (query) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (category !== "All") {
      list = list.filter((p) => p.categoryId === category);
    }

    if (subcategory !== "All") {
      list = list.filter((p) => p.subcategoryId === subcategory);
    }

    if (min !== null) {
      list = list.filter((p) => Number(p.price) >= min);
    }

    if (max !== null) {
      list = list.filter((p) => Number(p.price) <= max);
    }

    switch (sort) {
      case "price_low":
        return [...list].sort((a, b) => Number(a.price) - Number(b.price));
      case "price_high":
        return [...list].sort((a, b) => Number(b.price) - Number(a.price));
      case "name_asc":
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        return [...list].sort((a, b) => b.name.localeCompare(a.name));
      default:
        return list;
    }
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

  /* ----------------------------------------------------
     WEB (DESKTOP + MOBILE WEB)
  ---------------------------------------------------- */
  if (Platform.OS === "web") {
    return (
      <ScrollView contentContainerStyle={styles.webGrid}>
        {filteredProducts.map((p) => (
          <View
            key={p.id}
            style={{
              flexBasis: `${100 / numColumns}%`,
              maxWidth: `${100 / numColumns}%`,
            }}
          >
            <ProductCard
              product={p}
              width={undefined}
              wishlist={wishlist[p.id] || false}
              onToggleWishlist={() => toggleWishlist(p.id)}
              onOpen={() => router.push(`/product/${p.id}`)}
            />
          </View>
        ))}
      </ScrollView>
    );
  }

  /* ----------------------------------------------------
     NATIVE (iOS / ANDROID)
  ---------------------------------------------------- */
  return (
    <FlatList
      data={filteredProducts}
      key={numColumns}
      numColumns={numColumns}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          width={cardWidth!}
          wishlist={wishlist[item.id] || false}
          onToggleWishlist={() => toggleWishlist(item.id)}
          onOpen={() => router.push(`/product/${item.id}`)}
        />
      )}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  );
}

/* ----------------------------------------------------
   STYLES
---------------------------------------------------- */
const styles = StyleSheet.create({
  webGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
  },
});
