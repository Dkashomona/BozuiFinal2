import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../src/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { router } from "expo-router";

import AdminHeader from "../../src/components/admin/AdminHeader";
import AdminReviewDashboard from "../../src/components/admin/reviews/AdminReviewDashboard";

export default function AdminReviewsScreen() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists() || snap.data().role !== "admin") {
        alert("Access denied. Admins only.");
        router.replace("/(tabs)");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Checking admin permissions...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Admin access required</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* ✅ ADMIN HEADER */}
      <AdminHeader title="Review Moderation" />

      <AdminReviewDashboard />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
