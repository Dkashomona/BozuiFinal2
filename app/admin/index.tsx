/*
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../src/store/authStore";

interface CardProps {
  title: string;
  emoji: string;
  route: Parameters<typeof router.push>[0];
}

export default function AdminDashboardHome() {
  const { role } = useAuth();

  function Card({ title, emoji, route }: CardProps) {
    return (
      <TouchableOpacity
        onPress={() => router.push(route)}
        style={{
          backgroundColor: "white",
          padding: 20,
          borderRadius: 16,
          width: "48%",
          marginBottom: 15,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 28 }}>{emoji}</Text>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 8 }}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>
        Admin Dashboard – {role}
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginTop: 30,
        }}
      >
        <Card title="Add Product" emoji="➕" route="/admin/products/add-product" />
        <Card title="Products" emoji="📦" route="/admin/products" />

        <Card title="Create Category" emoji="📂" route="/admin/categories/add-category" />
        <Card title="Categories" emoji="🗂" route="/admin/categories" />

        <Card title="Add Subcategory" emoji="📁" route="/admin/subcategories/add-subcategory" />
        <Card title="Subcategories" emoji="🧩" route="/admin/subcategories" />

        <Card title="Create Campaign" emoji="🎯" route="/admin/campaigns/add-campaign" />
        <Card title="Campaigns" emoji="🎬" route="/admin/campaigns" />
        <Card title="Cart Settings" emoji="🛒" route="/admin/cart/cart-settings" />
      
      </View>
    </ScrollView>
  );
}
*/
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router, type Href } from "expo-router";

const cards: { title: string; emoji: string; route: Href }[] = [
  { title: "Orders", emoji: "🛒", route: "/admin/orders" },

  { title: "Products List", emoji: "📦", route: "/admin/products" },
  {
    title: "Add Product",
    emoji: "➕📦",
    route: "/admin/products/add-product",
  },

  { title: "Categories List", emoji: "🗂️", route: "/admin/categories" },
  {
    title: "Add Category",
    emoji: "➕🗂️",
    route: "/admin/categories/add-category",
  },

  {
    title: "Subcategories List",
    emoji: "🧩",
    route: "/admin/subcategories",
  },
  {
    title: "Add Subcategory",
    emoji: "➕🧩",
    route: "/admin/subcategories/add-subcategory",
  },

  { title: "Campaigns", emoji: "🎯", route: "/admin/campaigns" },
  {
    title: "Add Campaign",
    emoji: "➕🎯",
    route: "/admin/campaigns/add-campaign",
  },

  { title: "Cart Settings", emoji: "⚙️", route: "/admin/cart/cart-settings" },

  { title: "Inventory", emoji: "📊", route: "/admin/inventory" },

  { title: "Customers", emoji: "👥", route: "/admin/customers" },

  { title: "Analytics", emoji: "📈", route: "/admin/analytics" },

  {
    title: "Shipping Zones",
    emoji: "🚚",
    route: "/admin/shipping-zones",
  },

  { title: "Payouts", emoji: "💵", route: "/admin/payouts" },

  {
    title: "Notifications",
    emoji: "🔔",
    route: "/admin/notifications",
  },
];

function Card({
  title,
  emoji,
  route,
}: {
  title: string;
  emoji: string;
  route: Href;
}) {
  return (
    <TouchableOpacity
      onPress={() => router.push(route)}
      style={{
        backgroundColor: "white",
        padding: 20,
        borderRadius: 16,
        width: "48%",
        marginBottom: 18,
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 30 }}>{emoji}</Text>
      <Text style={{ fontSize: 16, marginTop: 8, fontWeight: "bold" }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default function AdminDashboard() {
  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        Admin Dashboard
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {cards.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </View>
    </ScrollView>
  );
}
