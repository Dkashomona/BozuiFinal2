/*
import { Tabs } from "expo-router";
import { Text, Platform } from "react-native";

export default function TabLayout() {
  const isMobile = Platform.OS === "ios" || Platform.OS === "android";

  return (
    <Tabs
      screenOptions={{
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
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🛒</Text>,
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>💛</Text>,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
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
          height: isMobile ? 60 : 65,
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
