import { Picker } from "@react-native-picker/picker";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { db } from "../../services/firebase";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  createdAt: number;
}

export default function CategoryDropdown({ value, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const snap = await getDocs(collection(db, "categories"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
    setCategories(list);
  }

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ marginBottom: 6 }}>Category</Text>

      <Picker selectedValue={value} onValueChange={onChange}>
        <Picker.Item label="Select Category" value="" />

        {categories.map((c) => (
          <Picker.Item label={c.name} value={c.id} key={c.id} />
        ))}
      </Picker>
    </View>
  );
}
