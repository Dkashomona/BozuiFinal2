import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

import { auth, db } from "../../src/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { router } from "expo-router";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const { width } = useWindowDimensions();

  const numColumns = width < 500 ? 2 : width < 900 ? 3 : 5;
  const cardWidth = Math.min(width / numColumns - 20, 260);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    const user = auth.currentUser;
    if (!user) return;

    // Load wishlist IDs
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const data = snap.data();

    if (!data?.wishlist || data.wishlist.length === 0) {
      setItems([]);
      return;
    }

    // Load each product
    const loaded: any[] = [];

    for (const pid of data.wishlist) {
      const pRef = doc(db, "products", pid);
      const pSnap = await getDoc(pRef);

      if (pSnap.exists()) {
        loaded.push({ id: pid, ...pSnap.data() });
      }
    }

    setItems(loaded);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>💛 Your Wishlist</Text>

      {items.length === 0 ? (
        <View style={{ marginTop: 40, alignItems: "center" }}>
          <Text style={{ fontSize: 16, opacity: 0.6 }}>
            Your wishlist is empty.
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {items.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.card, { width: cardWidth }]}
              onPress={() =>
                router.push({
                  pathname: "/product/[id]",
                  params: { id: p.id },
                })
              }
            >
              <Image
                source={{ uri: p.images?.[0] }}
                style={styles.image}
              />

              <Text numberOfLines={1} style={styles.name}>
                {p.name}
              </Text>

              {"price" in p && (
                <Text style={styles.price}>
                  ${Number(p.price).toFixed(2)}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    shadowColor: "#0003",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  image: {
    width: "100%",
    aspectRatio: 1.1,
    borderRadius: 10,
    marginBottom: 6,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
  },
  price: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#e67e22",
    marginTop: 2,
  },
});
