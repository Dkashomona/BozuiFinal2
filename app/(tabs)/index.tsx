/*
import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/store/authStore";

import SearchBar from "@/src/components/home/SearchBar";
import CartIcon from "@/src/components/cart/CartIcon";
import CampaignSlider from "@/src/components/home/CampaignSlider";
import ProductFeed from "@/src/components/home/ProductFeed";

export default function HomeScreen() {
  const { currentUser, role, loading } = useAuth();
  const name = currentUser?.displayName ?? "Guest";

  const isWeb = Platform.OS === "web";
  useWindowDimensions();

  /* ---------------- FILTER STATES ---------------- 
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [subcategory, setSubcategory] = useState("All");
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);

  /* ---------------- FILTER CALLBACKS ---------------- 
  const handleSearch = useCallback((v: string) => setQuery(v), []);
  const handleCategory = useCallback((c: string) => {
    setCategory(c);
    setSubcategory("All");
  }, []);
  const handleSubcategory = useCallback((s: string) => setSubcategory(s), []);
  const handleMin = useCallback((v: number) => setMin(v), []);
  const handleMax = useCallback((v: number) => setMax(v), []);

  /* ---------------- LOADING ---------------- 
  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  /* ---------------- MAIN UI ---------------- 
  return (
    <View style={styles.page}>
      {/* HEADER BAR *
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="location-outline"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />

          <View>
            <Text style={styles.headerHello}>Hello, {name}</Text>

            {currentUser ? (
              <Text style={styles.headerSub}>
                Delivering to: {currentUser.address?.city || "Set your address"}
              </Text>
            ) : (
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={styles.headerLoginLink}>Sign in for delivery</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <CartIcon />
      </View>

      {/* SEARCH BAR *
      <SearchBar
        onSearch={handleSearch}
        onCategory={handleCategory}
        onSubcategory={handleSubcategory}
        onMin={handleMin}
        onMax={handleMax}
      />

      {/* ADMIN BUTTON *
      {role === "admin" && (
        <TouchableOpacity
          style={styles.adminBtn}
          onPress={() => router.push("/admin")}
        >
          <Text style={styles.adminText}>Admin Panel</Text>
        </TouchableOpacity>
      )}

      {/* ---------------- WEB LAYOUT ---------------- *
      {isWeb ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <CampaignSlider
            query={query}
            category={category}
            subcategory={subcategory}
            min={min}
            max={max}
          />

          <ProductFeed
            isWeb
            query={query}
            category={category}
            subcategory={subcategory}
            min={min}
            max={max}
          />
        </ScrollView>
      ) : (
        /* ---------------- MOBILE LAYOUT ---------------- 
        <>
          <CampaignSlider
            query={query}
            category={category}
            subcategory={subcategory}
            min={min}
            max={max}
          />

          <ProductFeed
            query={query}
            category={category}
            subcategory={subcategory}
            min={min}
            max={max}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  /* HEADER 
  header: {
    backgroundColor: "#0f1111",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerHello: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },

  headerSub: {
    color: "#d1d1d1",
    fontSize: 13,
  },

  headerLoginLink: {
    color: "#87CEFA",
    fontSize: 13,
    textDecorationLine: "underline",
  },

  /* PAGE TITLES 
  section: {
    fontSize: 20,
    fontWeight: "700",
    margin: 16,
  },

  /* ADMIN BUTTON
  adminBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#FFD814",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 14,
    marginTop: 4,
  },

  adminText: {
    fontWeight: "700",
    color: "#111",
  },

  /* LOADING  
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
*/
import { Tabs } from "expo-router";
import { Text, Platform } from "react-native";

export default function TabLayout() {
  const isMobile = Platform.OS === "ios" || Platform.OS === "android";

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // 🔥 Remove all default headers (fix for Home showing)
        tabBarStyle: {
          height: isMobile ? 44 : 65,
          paddingBottom: isMobile ? 4 : 10,
          paddingTop: isMobile ? 4 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
      }}
    >
      {/* HOME TAB */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false, // 🔥 Ensure header is removed for Home
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />

      {/* CART TAB */}
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          headerShown: false,
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🛒</Text>,
        }}
      />

      {/* WISHLIST TAB */}
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          headerShown: false,
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>💛</Text>,
        }}
      />

      {/* PROFILE TAB */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
