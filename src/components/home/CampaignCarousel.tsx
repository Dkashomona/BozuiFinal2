import React, { useEffect, useRef, useState } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity, Animated } from "react-native";
import { getCampaigns } from "../../services/campaignService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

const CARD_WIDTH = 130;
const CARD_SPACING = 12;
const SCROLL_SPEED = 1.2; // TikTok-style continuous movement

export default function CampaignCarousel() {
  const [items, setItems] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  /** Load all campaigns + products */
  async function load() {
    const campaigns = await getCampaigns();
    let result: any[] = [];

    for (let camp of campaigns) {
      for (let pid of camp.productIds || []) {
        const snap = await getDoc(doc(db, "products", pid));
        if (snap.exists()) {
          result.push({
            campaignTitle: camp.title,
            ...snap.data(),
            id: pid,
          });
        }
      }
    }

    // Duplicate list to create infinite scroll
    setItems([...result, ...result]);
  }

  useEffect(() => {
    load();
  }, []);

  /** Auto-scroll effect like TikTok */
  useEffect(() => {
    let offset = 0;
    const interval = setInterval(() => {
      offset += SCROLL_SPEED;
      scrollViewRef.current?.scrollTo({ x: offset, animated: false });
      if (offset >= items.length * (CARD_WIDTH + CARD_SPACING)) {
        offset = 0;
      }
    }, 16);
    return () => clearInterval(interval);
  }, [items]);

  if (items.length === 0) return null;

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
        🔥 Featured Deals
      </Text>

      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false} // pure auto-scroll
        style={{ flexGrow: 0 }}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              width: CARD_WIDTH,
              marginRight: CARD_SPACING,
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 8,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            <Image
              source={{ uri: item.images?.[0] }}
              style={{
                width: "100%",
                height: 100,
                borderRadius: 10,
                backgroundColor: "#ddd",
              }}
            />

            <Text style={{ fontWeight: "bold", marginTop: 6 }} numberOfLines={1}>
              {item.name}
            </Text>

            <Text style={{ color: "green", marginTop: 4 }}>
              ${item.price}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>
    </View>
  );
}
