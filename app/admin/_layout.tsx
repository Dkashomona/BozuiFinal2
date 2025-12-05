import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="orders/index" />
      <Stack.Screen name="orders/[id]" />
      <Stack.Screen name="orders/refunds" />

      <Stack.Screen name="products/index" />
      <Stack.Screen name="products/add-product" />
      <Stack.Screen name="products/edit/[id]" />

      <Stack.Screen name="categories/index" />
      <Stack.Screen name="categories/add-category" />
      <Stack.Screen name="categories/edit/[id]" />

      <Stack.Screen name="subcategories/index" />
      <Stack.Screen name="subcategories/add-subcategory" />
      <Stack.Screen name="subcategories/edit/[id]" />

      <Stack.Screen name="campaigns/index" />

      <Stack.Screen name="cart/cart-settings" />

      <Stack.Screen name="inventory/index" />
      <Stack.Screen name="inventory/adjustments" />
      <Stack.Screen name="inventory/logs" />

      <Stack.Screen name="customers/index" />
      <Stack.Screen name="customers/[id]" />

      <Stack.Screen name="analytics/index" />
      <Stack.Screen name="analytics/sales" />
      <Stack.Screen name="analytics/products" />
      <Stack.Screen name="analytics/customers" />

      <Stack.Screen name="shipping-zones/index" />
      <Stack.Screen name="shipping-zones/add-zone" />
      <Stack.Screen name="shipping-zones/edit/[id]" />

      <Stack.Screen name="payouts/index" />
      <Stack.Screen name="payouts/manual" />
      <Stack.Screen name="payouts/history" />

      <Stack.Screen name="notifications/index" />
      <Stack.Screen name="notifications/send" />
      <Stack.Screen name="notifications/settings" />
    </Stack>
  );
}
