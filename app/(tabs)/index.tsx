/*

import { router } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";
import CampaignSlider from "../../src/components/home/CampaignSlider";
import ProductFeed from "../../src/components/home/ProductFeed";
import SearchBar from "../../src/components/home/SearchBar";
import { useAuth } from "../../src/store/authStore";
import CartIcon from "../../src/components/cart/CartIcon";

export default function HomeScreen() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.topStatic}>
        {role === "admin" && (
          <>
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>ADMIN MODE</Text>
            </View>
            <View style={{ marginBottom: 16 }}>
              <Button
                title="🛠 Go to Admin Dashboard"
                onPress={() => router.push("/admin")}
              />
            </View>
          </>
        )}

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <SearchBar />
          <CartIcon />
        </View>

        <CampaignSlider />

        <Text style={styles.sectionTitle}>🧺 All Products</Text>
      </View>

      <View style={styles.productArea}>
        <ProductFeed />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topStatic: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  productArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 16,
  },
  adminBadge: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  adminText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
});

*/
import { router } from "expo-router";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Platform,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import CampaignSlider from "../../src/components/home/CampaignSlider";
import ProductFeed from "../../src/components/home/ProductFeed";
import SearchBar from "../../src/components/home/SearchBar";
import { useAuth } from "../../src/store/authStore";
import CartIcon from "../../src/components/cart/CartIcon";

export default function HomeScreen() {
  const { role, loading } = useAuth();
  useWindowDimensions();
  const isWeb = Platform.OS === "web";

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // 🔥 Desktop/web layout → ScrollView wrapper
  if (isWeb) {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.topStatic}>
            {role === "admin" && (
              <>
                <View style={styles.adminBadge}>
                  <Text style={styles.adminText}>ADMIN MODE</Text>
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Button
                    title="🛠 Go to Admin Dashboard"
                    onPress={() => router.push("/admin")}
                  />
                </View>
              </>
            )}

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <SearchBar />
              <CartIcon />
            </View>

            <CampaignSlider />

            <Text style={styles.sectionTitle}>🧺 All Products</Text>
          </View>

          <View style={styles.productArea}>
            {/* 🔥 tell ProductFeed to render in web mode */}
            <ProductFeed isWeb />
          </View>
        </ScrollView>
      </View>
    );
  }

  // 🔥 Mobile/tablet layout → FlatList handles scrolling
  return (
    <View style={styles.page}>
      <View style={styles.topStatic}>
        {role === "admin" && (
          <>
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>ADMIN MODE</Text>
            </View>
            <View style={{ marginBottom: 16 }}>
              <Button
                title="🛠 Go to Admin Dashboard"
                onPress={() => router.push("/admin")}
              />
            </View>
          </>
        )}

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <SearchBar />
          <CartIcon />
        </View>

        <CampaignSlider />

        <Text style={styles.sectionTitle}>🧺 All Products</Text>
      </View>

      <View style={styles.productArea}>
        <ProductFeed />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topStatic: { paddingHorizontal: 16, paddingTop: 16 },
  productArea: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 22, fontWeight: "700", marginVertical: 16 },
  adminBadge: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  adminText: { color: "white", fontWeight: "bold", fontSize: 12 },
});