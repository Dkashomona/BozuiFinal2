import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Icon } from "@/src/components/icons/Icon";

const ICON_SIZE = Platform.OS === "web" ? 22 : 20;

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? "home" : "home-outline"}
              size={ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? "cart" : "cart-outline"}
              size={ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? "heart" : "heart-outline"}
              size={ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? "person" : "person-outline"}
              size={ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
