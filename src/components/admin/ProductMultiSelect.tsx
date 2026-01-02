import { collection, getDocs } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../services/firebase";

type Props = {
  selected: string[];
  onChange: (x: string[]) => void;
  search?: string;
};

export default function ProductMultiSelect({
  selected,
  onChange,
  search = "",
}: Props) {
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

  /* --------------------------------------------------
     SEARCH FILTER (PREMIUM & SAFE)
  -------------------------------------------------- */
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>Select Products</Text>

      <ScrollView style={{ maxHeight: 250, marginTop: 10 }}>
        {filteredProducts.map((p) => {
          const active = selected.includes(p.id);
          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => toggle(p.id)}
              style={{
                padding: 12,
                backgroundColor: active ? "#0F172A" : "#F1F5F9",
                marginBottom: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: active ? "#0F172A" : "#E5E7EB",
              }}
            >
              <Text
                style={{
                  color: active ? "#fff" : "#111827",
                  fontWeight: "700",
                }}
              >
                {p.name}
              </Text>
            </TouchableOpacity>
          );
        })}

        {filteredProducts.length === 0 && (
          <Text style={{ marginTop: 12, color: "#6B7280" }}>
            No products found
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
