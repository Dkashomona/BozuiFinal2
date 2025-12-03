import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Admin Dashboard" }} />

      {/* PRODUCTS */}
      <Stack.Screen name="products/index" options={{ title: "Products" }} />
      <Stack.Screen
        name="products/add-product"
        options={{ title: "Add Product" }}
      />
      <Stack.Screen
        name="products/edit/[id]"
        options={{ title: "Edit Product" }}
      />

      {/* CATEGORIES */}
      <Stack.Screen
        name="categories/index"
        options={{ title: "Categories" }}
      />
      <Stack.Screen
        name="categories/add-category"
        options={{ title: "Add Category" }}
      />
      <Stack.Screen
        name="categories/edit/[id]"
        options={{ title: "Edit Category" }}
      />

      {/* SUBCATEGORIES */}
      <Stack.Screen
        name="subcategories/index"
        options={{ title: "Subcategories" }}
      />
      <Stack.Screen
        name="subcategories/add-subcategory"
        options={{ title: "Add Subcategory" }}
      />
      <Stack.Screen
        name="subcategories/edit/[id]"
        options={{ title: "Edit Subcategory" }}
      />

      {/* CAMPAIGNS */}
      <Stack.Screen name="campaigns/index" options={{ title: "Campaigns" }} />
      <Stack.Screen
        name="campaigns/add-campaign"
        options={{ title: "Add Campaign" }}
      />
      {/* (optional) campaigns/edit/[id] later */}
    </Stack>
  );
}


