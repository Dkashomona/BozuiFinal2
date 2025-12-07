/*
import { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function SearchBar({
  onSearch,
  onCategory,
  onSubcategory,
  onMin,
  onMax,
}: any) {
  const [queryText, setQueryText] = useState("");

  const [categories, setCategories] = useState(["All"]);
  const [subcategories, setSubcategories] = useState(["All"]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSub, setSelectedSub] = useState("All");
  const [openFilters, setOpenFilters] = useState(false);

  /* ----------------------------------------------------
        LOAD CATEGORIES FROM FIRESTORE
  -----------------------------------------------------*
  useEffect(() => {
    async function loadCategories() {
      const snap = await getDocs(collection(db, "categories"));
      const list = ["All", ...snap.docs.map((d) => d.data().name)];

      // REMOVE DUPLICATES
      const unique = [...new Set(list)];

      setCategories(unique);
    }
    loadCategories();
  }, []);

  /* ----------------------------------------------------
        LOAD SUBCATEGORIES AFTER CATEGORY CHANGE
  -----------------------------------------------------*
  useEffect(() => {
    async function loadSubcategories() {
      if (selectedCategory === "All") {
        setSubcategories(["All"]);
        onSubcategory?.("All");
        return;
      }

      const catQuery = query(
        collection(db, "subcategories"),
        where("categoryName", "==", selectedCategory)
      );

      const snap = await getDocs(catQuery);
      const list = ["All", ...snap.docs.map((d) => d.data().name)];

      const unique = [...new Set(list)];

      setSubcategories(unique);
    }
    loadSubcategories();
  }, [onSubcategory, selectedCategory]);

  /* ---------------- Search Text ---------------- *
  function applySearch(text: string) {
    setQueryText(text);
    onSearch?.(text);
  }

  /* ---------------- Choose Category ---------------- *
  function chooseCategory(cat: string) {
    setSelectedCategory(cat);
    setSelectedSub("All"); // reset subcategory
    onCategory?.(cat);
  }

  /* ---------------- Choose Subcategory ---------------- *
  function chooseSub(sub: string) {
    setSelectedSub(sub);
    onSubcategory?.(sub);
  }

  return (
    <View style={styles.wrapper}>
      {/* SEARCH INPUT *
      <View style={styles.searchRow}>
        <Ionicons
          name="search"
          size={20}
          color="#555"
          style={{ marginLeft: 8 }}
        />

        <TextInput
          placeholder="Search products…"
          style={styles.input}
          value={queryText}
          onChangeText={applySearch}
        />

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setOpenFilters((prev) => !prev)}
        >
          <Ionicons name="options-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* FILTER PANEL *
      {openFilters && (
        <View style={styles.filterBox}>
          {/* CATEGORY *
          <Text style={styles.label}>Category</Text>
          <View style={styles.rowWrap}>
            {categories.map((c, index) => (
              <Chip
                key={`cat-${index}`}
                label={c}
                selected={c === selectedCategory}
                onPress={() => chooseCategory(c)}
              />
            ))}
          </View>

          {/* SUBCATEGORY *
          <Text style={styles.label}>Subcategory</Text>
          <View style={styles.rowWrap}>
            {subcategories.map((s, index) => (
              <Chip
                key={`sub-${index}`}
                label={s}
                selected={s === selectedSub}
                onPress={() => chooseSub(s)}
              />
            ))}
          </View>

          {/* PRICE RANGE *
          <Text style={styles.label}>Price Range</Text>
          <View style={styles.priceRow}>
            <TextInput
              placeholder="Min"
              style={styles.priceInput}
              keyboardType="numeric"
              onChangeText={(v) => onMin?.(Number(v))}
            />
            <TextInput
              placeholder="Max"
              style={styles.priceInput}
              keyboardType="numeric"
              onChangeText={(v) => onMax?.(Number(v))}
            />
          </View>
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------
            SMALL COMPONENT: FILTER CHIP
-------------------------------------------------------
function Chip({ label, selected, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "#232f3e",
    paddingBottom: 12,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 30,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    paddingHorizontal: 6,
    elevation: 2,
  },

  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
  },

  filterButton: {
    backgroundColor: "#eee",
    padding: 7,
    borderRadius: 20,
  },

  filterBox: {
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 10,
    padding: 14,
    elevation: 2,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    color: "#333",
  },

  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
    marginRight: 8,
    marginBottom: 8,
  },

  chipSelected: {
    backgroundColor: "#FFD814",
  },

  chipText: {
    color: "#444",
    fontSize: 13,
  },

  chipTextSelected: {
    color: "#111",
    fontWeight: "700",
  },

  priceRow: {
    flexDirection: "row",
    gap: 10,
  },

  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f7f7f7",
    padding: 10,
    borderRadius: 10,
  },
});
*/

import { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function SearchBar({
  onSearch,
  onCategory,
  onSubcategory,
  onMin,
  onMax,
}: any) {
  const [queryText, setQueryText] = useState("");

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([
    { id: "All", name: "All" },
  ]);

  const [subcategories, setSubcategories] = useState<
    { id: string; name: string }[]
  >([{ id: "All", name: "All" }]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSub, setSelectedSub] = useState("All");
  const [openFilters, setOpenFilters] = useState(false);

  /* ----------------------------------------------------
        LOAD CATEGORIES FROM FIRESTORE
  -----------------------------------------------------*/
  useEffect(() => {
    async function loadCategories() {
      const snap = await getDocs(collection(db, "categories"));

      const list = [
        { id: "All", name: "All" },
        ...snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
        })),
      ];

      setCategories(list);
    }

    loadCategories();
  }, []);

  /* ----------------------------------------------------
        LOAD SUBCATEGORIES AFTER CATEGORY CHANGE
  -----------------------------------------------------*/
  useEffect(() => {
    async function loadSubcategories() {
      if (selectedCategory === "All") {
        setSubcategories([{ id: "All", name: "All" }]);
        onSubcategory?.("All");
        return;
      }

      const q = query(
        collection(db, "subcategories"),
        where("categoryId", "==", selectedCategory)
      );

      const snap = await getDocs(q);

      const list = [
        { id: "All", name: "All" },
        ...snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
        })),
      ];

      setSubcategories(list);
    }

    loadSubcategories();
  }, [onSubcategory, selectedCategory]);

  /* ---------------- Search Text ---------------- */
  function applySearch(text: string) {
    setQueryText(text);
    onSearch?.(text);
  }

  /* ---------------- Choose Category ---------------- */
  function chooseCategory(cat: { id: string; name: string }) {
    setSelectedCategory(cat.id);
    setSelectedSub("All");
    onCategory?.(cat.id); // send categoryId
  }

  /* ---------------- Choose Subcategory ---------------- */
  function chooseSub(sub: { id: string; name: string }) {
    setSelectedSub(sub.id);
    onSubcategory?.(sub.id);
  }

  return (
    <View style={styles.wrapper}>
      {/* SEARCH INPUT */}
      <View style={styles.searchRow}>
        <Ionicons
          name="search"
          size={20}
          color="#555"
          style={{ marginLeft: 8 }}
        />

        <TextInput
          placeholder="Search products…"
          style={styles.input}
          value={queryText}
          onChangeText={applySearch}
        />

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setOpenFilters((prev) => !prev)}
        >
          <Ionicons name="options-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* FILTER PANEL */}
      {openFilters && (
        <View style={styles.filterBox}>
          {/* CATEGORY */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.rowWrap}>
            {categories.map((c) => (
              <Chip
                key={`cat-${c.id}`}
                label={c.name}
                selected={c.id === selectedCategory}
                onPress={() => chooseCategory(c)}
              />
            ))}
          </View>

          {/* SUBCATEGORY */}
          <Text style={styles.label}>Subcategory</Text>
          <View style={styles.rowWrap}>
            {subcategories.map((s) => (
              <Chip
                key={`sub-${s.id}`}
                label={s.name}
                selected={s.id === selectedSub}
                onPress={() => chooseSub(s)}
              />
            ))}
          </View>

          {/* PRICE RANGE */}
          <Text style={styles.label}>Price Range</Text>
          <View style={styles.priceRow}>
            <TextInput
              placeholder="Min"
              style={styles.priceInput}
              keyboardType="numeric"
              onChangeText={(v) => onMin?.(Number(v))}
            />
            <TextInput
              placeholder="Max"
              style={styles.priceInput}
              keyboardType="numeric"
              onChangeText={(v) => onMax?.(Number(v))}
            />
          </View>
        </View>
      )}
    </View>
  );
}

/* ------------------ CHIP COMPONENT ------------------ */
function Chip({ label, selected, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "#232f3e",
    paddingBottom: 12,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 30,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    paddingHorizontal: 6,
    elevation: 2,
  },

  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
  },

  filterButton: {
    backgroundColor: "#eee",
    padding: 7,
    borderRadius: 20,
  },

  filterBox: {
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 10,
    padding: 14,
    elevation: 2,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    color: "#333",
  },

  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
    marginRight: 8,
    marginBottom: 8,
  },

  chipSelected: {
    backgroundColor: "#FFD814",
  },

  chipText: {
    color: "#444",
    fontSize: 13,
  },

  chipTextSelected: {
    color: "#111",
    fontWeight: "700",
  },

  priceRow: {
    flexDirection: "row",
    gap: 10,
  },

  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f7f7f7",
    padding: 10,
    borderRadius: 10,
  },
});
