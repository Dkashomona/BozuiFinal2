// app/profile/index.tsx

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/src/store/authStore";
import { useEffect, useState } from "react";
import { db, auth } from "@/src/services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function ProfileDashboard() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    async function loadOrders() {
      if (!currentUser) return;
      const q = query(
        collection(db, "orders"),
        where("uid", "==", currentUser.uid)
      );
      const snap = await getDocs(q);

      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setOrders(list);
    }
    loadOrders();
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <ScrollView style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
              currentUser?.photoURL ||
              "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff",
          }}
          style={styles.avatar}
        />

        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username}>
            {currentUser?.displayName || currentUser?.email?.split("@")[0]}
          </Text>
        </View>
      </View>

      {/* QUICK ACTION GRID */}
      <View style={styles.grid}>
        <GridItem icon="📦" label="Your Orders" route="/profile/orders" />
        <GridItem icon="🚚" label="Track Package" route="/profile/orders" />
        <GridItem icon="🏠" label="Your Addresses" route="/profile/address" />
        <GridItem icon="💳" label="Payments" route="/profile/payments" />
        <GridItem icon="👤" label="Account" route="/profile/account" />
        <GridItem icon="🆘" label="Support" route="/profile/support" />
      </View>

      {/* ACCOUNT INFO CARD */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Your Info</Text>

        <Text style={styles.infoText}>Email: {currentUser?.email}</Text>
        {currentUser?.phoneNumber && (
          <Text style={styles.infoText}>Phone: {currentUser.phoneNumber}</Text>
        )}

        {currentUser?.address && (
          <Text style={styles.infoText}>
            Address: {currentUser.address.street}, {currentUser.address.city}
          </Text>
        )}

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push("/profile/account")}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* RECENT ORDERS */}
      <Text style={styles.sectionTitle}>Recent Orders</Text>

      {orders.length === 0 ? (
        <Text style={styles.empty}>No orders yet.</Text>
      ) : (
        orders.slice(0, 5).map((o) => (
          <TouchableOpacity
            key={o.id}
            style={styles.orderCard}
            onPress={() => router.push(`/order/${o.id}`)}
          >
            <Image
              source={{
                uri:
                  o.items?.[0]?.image ||
                  "https://via.placeholder.com/80?text=Item",
              }}
              style={styles.orderImg}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.orderId}>Order #{o.id}</Text>
              <Text style={styles.orderStatus}>
                Status: {o.status?.toUpperCase()}
              </Text>

              <Text style={styles.orderAmount}>
                ${Number(o.total ?? o.amount ?? 0).toFixed(2)}
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))
      )}

      {/* LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* GRID ITEM COMPONENT */
function GridItem({ icon, label, route }: any) {
  return (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => router.push(route)}
    >
      <Text style={styles.gridIcon}>{icon}</Text>
      <Text style={styles.gridLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },

  avatar: { width: 65, height: 65, borderRadius: 40, marginRight: 15 },
  greeting: { fontSize: 16, color: "#777" },
  username: { fontSize: 22, fontWeight: "700" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 20,
  },

  gridItem: {
    width: "47%",
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  gridIcon: { fontSize: 28, marginBottom: 8 },
  gridLabel: { fontSize: 14, fontWeight: "600", textAlign: "center" },

  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#eee",
  },

  infoTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  infoText: { fontSize: 14, marginBottom: 6, color: "#555" },

  editBtn: {
    marginTop: 12,
    backgroundColor: "#e67e22",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  editText: { color: "#fff", fontWeight: "700" },

  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 14 },
  empty: { color: "#777", marginBottom: 20 },

  orderCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  orderImg: { width: 70, height: 70, borderRadius: 10, marginRight: 14 },
  orderId: { fontSize: 16, fontWeight: "700" },
  orderStatus: { fontSize: 14, color: "#888", marginTop: 2 },
  orderAmount: { fontSize: 16, fontWeight: "700", marginTop: 6 },

  chevron: { fontSize: 26, color: "#ccc", marginLeft: 8 },

  logoutBtn: {
    backgroundColor: "#cc0000",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  logoutText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
