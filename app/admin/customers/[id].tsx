import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { db } from "../../../src/services/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      const userSnap = await getDoc(doc(db, "users", String(id)));
      if (userSnap.exists()) setUser(userSnap.data());

      const q = query(collection(db, "orders"), where("uid", "==", id));
      const orderSnap = await getDocs(q);

      const list: any[] = [];
      orderSnap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setOrders(list);

      setLoading(false);
    }

    loadData();
  }, [id]);

  if (loading || !user) {
    return (
      <View style={styles.center}>
        <Text>Loading customer...</Text>
      </View>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + (o.amount ?? 0), 0);

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Customer Details</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user.name ?? "No name"}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{user.role ?? "customer"}</Text>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.stat}>Total Orders: {orders.length}</Text>
        <Text style={styles.stat}>Total Spent: ${totalSpent.toFixed(2)}</Text>
      </View>

      {/* Recent Orders */}
      <Text style={styles.subtitle}>Recent Orders</Text>

      {orders.map((o) => (
        <View key={o.id} style={styles.orderCard}>
          <Text style={styles.orderText}>Order #{o.id}</Text>
          <Text style={styles.orderText}>Amount: ${o.amount}</Text>
          <Text style={styles.orderText}>Status: {o.status}</Text>
        </View>
      ))}

      {/* Actions */}
      <TouchableOpacity
        style={styles.orangeBtn}
        onPress={() => Linking.openURL(`mailto:${user.email}`)}
      >
        <Text style={styles.btnText}>Send Email</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.orangeBtnOutline}
        onPress={() =>
          alert("Connect to /admin/orders and filter by customer id")
        }
      >
        <Text style={styles.btnTextOutline}>View All Orders</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#fff", flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },

  section: {
    padding: 16,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    marginBottom: 20,
  },

  label: { fontSize: 14, color: "#777", marginTop: 6 },
  value: { fontSize: 18, fontWeight: "600" },

  stat: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  subtitle: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },

  orderCard: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
  },
  orderText: { fontSize: 15, color: "#444" },

  orangeBtn: {
    backgroundColor: "#e67e22",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },

  orangeBtnOutline: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    borderColor: "#e67e22",
    borderWidth: 2,
  },
  btnTextOutline: {
    color: "#e67e22",
    fontWeight: "700",
    fontSize: 16,
  },
});
