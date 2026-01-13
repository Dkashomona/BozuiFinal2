import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Platform,
  Pressable,
} from "react-native";
import { router, type Href } from "expo-router";
import { useState } from "react";
import AdminHeader from "../../src/components/admin/AdminHeader";

/* --------------------------------------------------
   ROLE (replace later with auth / Firestore)
-------------------------------------------------- */
type Role = "admin" | "staff" | "viewer";
const role: Role = "admin";

/* --------------------------------------------------
   BADGE COUNTS (mock → Firestore later)
-------------------------------------------------- */
const badgeCounts = {
  orders: 12,
  reviews: 4,
  notifications: 7,
};

/* --------------------------------------------------
   DASHBOARD CARDS (ALL CONSIDERED)
-------------------------------------------------- */
const cards: {
  title: string;
  emoji: string;
  route: Href;
  badge?: number;
  roles?: Role[];
}[] = [
  {
    title: "Orders",
    emoji: "🛒",
    route: "/admin/orders",
    badge: badgeCounts.orders,
  },

  {
    title: "Products List",
    emoji: "📦",
    route: "/admin/products",
    roles: ["admin", "staff"],
  },
  {
    title: "Add Product",
    emoji: "➕📦",
    route: "/admin/products/add-product",
    roles: ["admin"],
  },

  {
    title: "Categories List",
    emoji: "🗂️",
    route: "/admin/categories",
    roles: ["admin", "staff"],
  },
  {
    title: "Add Category",
    emoji: "➕🗂️",
    route: "/admin/categories/add-category",
    roles: ["admin"],
  },

  {
    title: "Subcategories List",
    emoji: "🧩",
    route: "/admin/subcategories",
    roles: ["admin", "staff"],
  },
  {
    title: "Add Subcategory",
    emoji: "➕🧩",
    route: "/admin/subcategories/add-subcategory",
    roles: ["admin"],
  },

  {
    title: "Campaigns",
    emoji: "🎯",
    route: "/admin/campaigns",
    roles: ["admin"],
  },
  {
    title: "Add Campaign",
    emoji: "➕🎯",
    route: "/admin/campaigns/add-campaign",
    roles: ["admin"],
  },

  {
    title: "Cart Settings",
    emoji: "⚙️",
    route: "/admin/cart/cart-settings",
    roles: ["admin"],
  },
  {
    title: "Inventory",
    emoji: "📊",
    route: "/admin/inventory",
    roles: ["admin", "staff"],
  },
  {
    title: "Customers",
    emoji: "👥",
    route: "/admin/customers",
    roles: ["admin", "staff"],
  },
  {
    title: "Analytics",
    emoji: "📈",
    route: "/admin/analytics",
    roles: ["admin"],
  },

  {
    title: "Shipping Zones",
    emoji: "🚚",
    route: "/admin/shipping-zones",
    roles: ["admin"],
  },
  { title: "Refund", emoji: "💵", route: "/admin/refunds", roles: ["admin"] },

  {
    title: "Notifications",
    emoji: "🔔",
    route: "/admin/notifications",
    badge: badgeCounts.notifications,
    roles: ["admin", "staff"],
  },

  {
    title: "WhatsApp Settings",
    emoji: "💬",
    route: "/admin/settings/WhatsAppSettings",
    roles: ["admin"],
  },

  {
    title: "Review Moderation",
    emoji: "📝",
    route: "/admin/reviews",
    badge: badgeCounts.reviews,
    roles: ["admin", "staff"],
  },
];

/* --------------------------------------------------
   CARD COMPONENT (PRESSABLE = TS SAFE)
-------------------------------------------------- */
function Card({
  title,
  emoji,
  route,
  badge,
}: {
  title: string;
  emoji: string;
  route: Href;
  badge?: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={() => router.push(route)}
      onHoverIn={Platform.OS === "web" ? () => setHovered(true) : undefined}
      onHoverOut={Platform.OS === "web" ? () => setHovered(false) : undefined}
      style={[
        styles.card,
        hovered && Platform.OS === "web" && styles.cardHover,
      ]}
    >
      {badge !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </Pressable>
  );
}

/* --------------------------------------------------
   SCREEN
-------------------------------------------------- */
export default function AdminDashboard() {
  return (
    <View style={{ flex: 1 }}>
      {/* HOME ICON IN HEADER (DASHBOARD ONLY) */}
      <AdminHeader title="Admin Dashboard" isDashboard />

      {/* 🔥 FLOATING HOME BUTTON */}
      <Pressable
        onPress={() => router.replace("/(tabs)")}
        style={({ pressed }) => [
          styles.homeBtn,
          pressed && styles.homeBtnPressed,
        ]}
      >
        <Text style={styles.homeIcon}>🏠</Text>
        <Text style={styles.homeText}>Home</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.grid}>
          {cards
            .filter((c) => !c.roles || c.roles.includes(role))
            .map((c) => (
              <Card key={c.title} {...c} />
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

/* --------------------------------------------------
   STYLES
-------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 18,
    width: "48%",
    marginBottom: 18,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,

    transform: [{ translateY: 0 }],
  },

  cardHover: {
    transform: [{ translateY: -6 }],
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  homeBtn: {
    position: "fixed", // web
    top: 20,
    right: 20,
    zIndex: 1000,

    flexDirection: "row",
    alignItems: "center",
    gap: 6,

    backgroundColor: "#111",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  homeBtnPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },

  homeIcon: {
    fontSize: 18,
  },

  homeText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },

  emoji: {
    fontSize: 30,
  },

  cardTitle: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: "700",
  },

  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#e74c3c",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
});
