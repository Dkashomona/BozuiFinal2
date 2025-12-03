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
      {/* HEADER */}
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

      {/* LIST */}
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
            {/* IMAGE */}
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

            {/* INFO */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold", fontSize: 17 }}>{item.title}</Text>
              {item.subtitle ? (
                <Text style={{ color: "#555" }}>{item.subtitle}</Text>
              ) : null}

              {/* BUTTONS */}
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
