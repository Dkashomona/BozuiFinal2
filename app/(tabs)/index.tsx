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

  /* ---------------- FILTER STATES ---------------- */
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [subcategory, setSubcategory] = useState("All");
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);

  /* ---------------- FILTER CALLBACKS ---------------- */
  const handleSearch = useCallback((v: string) => setQuery(v), []);
  const handleCategory = useCallback((c: string) => {
    setCategory(c);
    setSubcategory("All");
  }, []);
  const handleSubcategory = useCallback((s: string) => setSubcategory(s), []);
  const handleMin = useCallback((v: number) => setMin(v), []);
  const handleMax = useCallback((v: number) => setMax(v), []);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <View style={styles.page}>
      {/* SEARCH BAR — LOWERED on Mobile */}
      {Platform.OS === "web" ? (
        <SearchBar
          onSearch={handleSearch}
          onCategory={handleCategory}
          onSubcategory={handleSubcategory}
          onMin={handleMin}
          onMax={handleMax}
        />
      ) : (
        <View style={styles.mobileSearchWrapper}>
          <SearchBar
            onSearch={handleSearch}
            onCategory={handleCategory}
            onSubcategory={handleSubcategory}
            onMin={handleMin}
            onMax={handleMax}
          />
        </View>
      )}

      {/* --------------------------------------
           DELIVER TO + SIGN IN under search (Mobile Only)
         -------------------------------------- */}
      {Platform.OS !== "web" && (
        <View style={styles.mobileInfoRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="location"
              size={18}
              color="#fff"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.mobileDeliverText}>
              Deliver to{" "}
              {currentUser
                ? currentUser.address?.city || "Set your address"
                : "Sign in"}
            </Text>
          </View>

          {!currentUser && (
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.mobileSignIn}>Sign in ›</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* --------------------------------------
           DESKTOP / WEB HEADER
         -------------------------------------- */}
      {isWeb && (
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
                  Delivering to:{" "}
                  {currentUser.address?.city || "Set your address"}
                </Text>
              ) : (
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={styles.headerLoginLink}>
                    Sign in for delivery
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <CartIcon />
        </View>
      )}

      {/* ADMIN BUTTON */}
      {role === "admin" && (
        <TouchableOpacity
          style={styles.adminBtn}
          onPress={() => router.push("/admin")}
        >
          <Text style={styles.adminText}>Admin Panel</Text>
        </TouchableOpacity>
      )}

      {/* ---------------- WEB LAYOUT ---------------- */}
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

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  /* SEARCH WRAPPER ON MOBILE (LOWERED) */
  mobileSearchWrapper: {
    marginTop: Platform.OS === "ios" ? 40 : 25, // LOWERED SEARCH BAR
    paddingHorizontal: 10,
  },

  /* MOBILE: Deliver to + Sign-in */
  mobileInfoRow: {
    backgroundColor: "rgba(249, 22, 5, 1)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  mobileDeliverText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  mobileSignIn: {
    color: "#FFD814",
    fontSize: 14,
    fontWeight: "700",
  },

  /* WEB HEADER */
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

  /* ADMIN BUTTON */
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

  /* LOADING CENTER */
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
