import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { db } from "../../services/firebase";

interface SubcategoryDropdownProps {
  categoryId: string;
  value: string;
  onChange: (v: string) => void;
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export default function SubcategoryDropdown({
  categoryId,
  value,
  onChange,
}: SubcategoryDropdownProps) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }

    async function load() {
      const q = query(
        collection(db, "subcategories"),
        where("categoryId", "==", categoryId)
      );

      const snap = await getDocs(q);
      const list = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as Omit<Subcategory, "id">) })
      );

      setSubcategories(list);
    }

    load();
  }, [categoryId]); // ONLY dependency

  return (
    <View style={{ marginBottom: 20 }}>
      <Text>Subcategory</Text>

      <Picker
        enabled={categoryId !== ""}
        selectedValue={value}
        onValueChange={onChange}
      >
        <Picker.Item label="Select Subcategory" value="" />
        {subcategories.map((s) => (
          <Picker.Item key={s.id} label={s.name} value={s.id} />
        ))}
      </Picker>
    </View>
  );
}
