import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useState, useCallback } from "react";
import { useAuth } from "@/src/store/authStore";

import { Icon } from "@/src/components/icons/Icon";
import SearchBar from "@/src/components/home/SearchBar";
import CartIcon from "@/src/components/cart/CartIcon";
import CampaignSlider from "@/src/components/home/CampaignSlider";
import ProductFeed from "@/src/components/products/ProductFeed";

export default function HomeScreen() {
  const { currentUser, role, loading } = useAuth();
  const name = currentUser?.displayName ?? "Guest";
  const isWeb = Platform.OS === "web";

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

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {/* SEARCH BAR */}
      {isWeb ? (
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

      {/* MOBILE INFO BAR */}
      {!isWeb && (
        <View style={styles.mobileInfoRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name="location" size={18} color="#fff" />
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

      {/* WEB HEADER */}
      {isWeb && (
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name="location-outline" size={20} color="white" />
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

      {/* ADMIN */}
      {role === "admin" && (
        <TouchableOpacity
          style={styles.adminBtn}
          onPress={() => router.push("/admin")}
        >
          <Text style={styles.adminText}>Admin Panel</Text>
        </TouchableOpacity>
      )}

      {/* CONTENT */}
      {isWeb ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <CampaignSlider
            query={query}
            category={category}
            subcategory={subcategory}
            min={min ?? undefined}
            max={max ?? undefined}
          />

          <ProductFeed
            query={query}
            category={category}
            subcategory={subcategory}
            min={min ?? undefined}
            max={max ?? undefined}
          />
        </ScrollView>
      ) : (
        <>
          <CampaignSlider
            query={query}
            category={category}
            subcategory={subcategory}
            min={min ?? undefined}
            max={max ?? undefined}
          />

          <ProductFeed
            query={query}
            category={category}
            subcategory={subcategory}
            min={min ?? undefined}
            max={max ?? undefined}
          />
        </>
      )}
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f5f5f5" },
  mobileSearchWrapper: {
    marginTop: Platform.OS === "ios" ? 40 : 25,
    paddingHorizontal: 10,
  },
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
    marginLeft: 4,
  },
  mobileSignIn: {
    color: "#FFD814",
    fontSize: 14,
    fontWeight: "700",
  },
  header: {
    backgroundColor: "#0f1111",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerHello: { color: "white", fontSize: 17, fontWeight: "700" },
  headerSub: { color: "#d1d1d1", fontSize: 13 },
  headerLoginLink: {
    color: "#87CEFA",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  adminBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#FFD814",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 14,
    marginTop: 4,
  },
  adminText: { fontWeight: "700", color: "#111" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
