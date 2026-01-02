/*
import { router } from "expo-router";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../../src/services/firebase";

interface Campaign {
  id: string;
  title: string;
  subtitle?: string;
  bannerImage?: string;
  productIds?: string[];
}

export default function CampaignsOverview() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCampaigns = useCallback(async () => {
    const snap = await getDocs(collection(db, "campaigns"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Campaign[];
    setCampaigns(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  async function removeCampaign(id: string) {
    await deleteDoc(doc(db, "campaigns", id));
    alert("Campaign deleted");
    loadCampaigns();
  }

  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading campaigns...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      {/* HEADER *
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold" }}>🎬 Campaigns Overview</Text>

        <TouchableOpacity
          onPress={() => router.push("/admin/campaigns/add-campaign")}
          style={{
            backgroundColor: "#1E90FF",
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>+ ADD NEW CAMPAIGN</Text>
        </TouchableOpacity>
      </View>

      {/* LIST *
      <FlatList
        data={campaigns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 20 }}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "white",
              padding: 15,
              borderRadius: 12,
              elevation: 3,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* IMAGE *
            {item.bannerImage ? (
              <Image
                source={{ uri: item.bannerImage }}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 8,
                  backgroundColor: "#eee",
                }}
              />
            ) : (
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 8,
                  backgroundColor: "#ddd",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text>No Image</Text>
              </View>
            )}

            {/* INFO *
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold", fontSize: 17 }}>{item.title}</Text>
              {item.subtitle ? (
                <Text style={{ color: "#555" }}>{item.subtitle}</Text>
              ) : null}

              {/* BUTTONS *
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  gap: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/admin/campaigns/edit/[id]",
                      params: { id: item.id },
                    })
                  }
                  style={{
                    backgroundColor: "#1E90FF",
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>EDIT</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => removeCampaign(item.id)}
                  style={{
                    backgroundColor: "red",
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>DELETE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
*/

import { router } from "expo-router";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { db } from "../../../src/services/firebase";
import AdminHeader from "../../../src/components/admin/AdminHeader";

interface Campaign {
  id: string;
  title: string;
  subtitle?: string;
  bannerImage?: string;
  productIds?: string[];
}

export default function CampaignsOverview() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCampaigns = useCallback(async () => {
    const snap = await getDocs(collection(db, "campaigns"));
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Campaign[];
    setCampaigns(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  async function removeCampaign(id: string) {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this campaign?\n\nThis action cannot be undone."
      );

      if (!confirmed) return;

      await deleteDoc(doc(db, "campaigns", id));
      alert("Campaign deleted");
      loadCampaigns();
      return;
    }

    // Mobile (iOS / Android)
    Alert.alert(
      "Delete Campaign",
      "Are you sure you want to delete this campaign? This action cannot be undone.",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            await deleteDoc(doc(db, "campaigns", id));
            alert("Campaign deleted");
            loadCampaigns();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AdminHeader title="Campaigns" isDashboard />

      <View style={styles.page}>
        {/* HEADER */}
        <View style={styles.topRow}>
          <Text style={styles.pageTitle}>🎬 Campaigns</Text>

          <TouchableOpacity
            onPress={() => router.push("/admin/campaigns/add-campaign")}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>+ Add Campaign</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={styles.loading}>Loading campaigns…</Text>
        ) : (
          <FlatList
            data={campaigns}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                {/* IMAGE */}
                {item.bannerImage ? (
                  <Image
                    source={{ uri: item.bannerImage }}
                    style={styles.image}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text>No Image</Text>
                  </View>
                )}

                {/* INFO */}
                <View style={styles.info}>
                  <Text style={styles.title}>{item.title}</Text>

                  {item.subtitle ? (
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                  ) : null}

                  {/* ACTIONS */}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/admin/campaigns/edit/[id]",
                          params: { id: item.id },
                        })
                      }
                      style={styles.editBtn}
                    >
                      <Text style={styles.btnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => removeCampaign(item.id)}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.btnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/* ======================================================
   STYLES — MOBILE FIRST
====================================================== */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  page: {
    flex: 1,
    padding: 16,
  },
  topRow: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
  },
  addBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#1E90FF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "800",
  },
  loading: {
    marginTop: 20,
    fontSize: 16,
  },
  list: {
    gap: 14,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      },
      default: {
        elevation: 3,
      },
    }),
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
  },
  subtitle: {
    color: "#555",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    flexWrap: "wrap",
  },
  editBtn: {
    backgroundColor: "#1E90FF",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: "#D63031",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  btnText: {
    color: "#fff",
    fontWeight: "800",
  },
});
