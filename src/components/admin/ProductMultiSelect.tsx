import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../services/firebase";

export default function ProductMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (x: string[]) => void;
}) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const snap = await getDocs(collection(db, "products"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProducts(list);
  }

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>Select Products</Text>

      <ScrollView style={{ maxHeight: 250, marginTop: 10 }}>
        {products.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => toggle(p.id)}
            style={{
              padding: 12,
              backgroundColor: selected.includes(p.id)
                ? "#4A90E2"
                : "#eee",
              marginBottom: 10,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: selected.includes(p.id) ? "white" : "#333",
                fontWeight: "bold",
              }}
            >
              {p.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
