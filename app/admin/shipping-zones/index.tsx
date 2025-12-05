// app/admin/shipping-zones/index.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import { router, type Href } from "expo-router";
import { db } from "../../../src/services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ShippingZones() {
  const [zones, setZones] = useState<any[]>([]);

  useEffect(() => {
    async function loadZones() {
      const snap = await getDocs(collection(db, "shipping_zones"));
      const list: any[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setZones(list);
    }
    loadZones();
  }, []);

  return (
    <ScrollView style={styles.page}>
      {/* 🔙 BACK BUTTON */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.push({ pathname: "/admin" } as Href)}
      >
        <Text style={styles.backBtnText}>← Back to Admin Panel</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Shipping Zones</Text>

      {zones.map((z) => (
        <TouchableOpacity
          key={z.id}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/admin/shipping-zones/edit/[id]",
              params: { id: z.id },
            } as Href)
          }
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.zoneName}>{z.name}</Text>
            <Text style={styles.subtext}>{z.countries.join(", ")}</Text>
            <Text style={styles.subtext}>
              ${z.price} • {z.eta}
            </Text>
          </View>

          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}

      {/* ADD NEW */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() =>
          router.push({
            pathname: "/admin/shipping-zones/add-zone",
          } as Href)
        }
      >
        <Text style={styles.addText}>+ Add New Zone</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#fff", flex: 1 },

  backBtn: { marginBottom: 10 },
  backBtnText: { color: "#e67e22", fontSize: 16, fontWeight: "600" },

  title: { fontSize: 28, fontWeight: "700", marginBottom: 20 },

  card: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
    alignItems: "center",
  },

  zoneName: { fontSize: 18, fontWeight: "600" },
  subtext: { fontSize: 14, color: "#777" },
  chevron: { fontSize: 28, color: "#ccc", marginLeft: 10 },

  addBtn: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#e67e22",
    borderRadius: 12,
    alignItems: "center",
  },
  addText: { color: "white", fontWeight: "700", fontSize: 16 },
});
