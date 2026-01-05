/*
import { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Text,
  Platform,
  Animated,
  ScrollView,
  useColorScheme,
  Keyboard,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import SortMenu, { SortOption } from "./SortMenu";

export default function SearchBar({
  onSearch,
  onCategory,
  onSubcategory,
  onMin,
  onMax,
  onClear,
  onSortChange,
}: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  /* ---------- THEME ---------- 
  const theme = {
    bg: isDark ? "#1a1a1a" : "#ffffff",
    text: isDark ? "#f2f2f2" : "#222",
    chipBg: isDark ? "#333" : "#f2f2f2",
    chipSelected: "#FFD814",
    border: isDark ? "#444" : "#ddd",
    inputBg: isDark ? "#2a2a2a" : "#f7f7f7",
  };

  /* ---------- STATE ---------- 
  const [queryText, setQueryText] = useState("");

  const [categories, setCategories] = useState([{ id: "All", name: "All" }]);
  const [subcategories, setSubcategories] = useState([
    { id: "All", name: "All" },
  ]);

  const [selectedCategoryId, setSelectedCategoryId] = useState("All");
  const [selectedCategoryName, setSelectedCategoryName] = useState("All");
  const [selectedSub, setSelectedSub] = useState("All");

  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");

  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>("none");

  const [openFilters, setOpenFilters] = useState(false);

  /* ---------- ANIMATION ---------- 
  const screenHeight = Dimensions.get("window").height;
  const contentHeight = useRef(0);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  /* ---------- INPUT HANDLERS ---------- 

  const handleSearchText = useCallback(
    (text: string) => {
      setQueryText(text);
      onSearch?.(text);
    },
    [onSearch]
  );

  const handleCategory = useCallback(
    (id: string, name: string) => {
      setSelectedCategoryId(id);
      setSelectedCategoryName(name);
      setSelectedSub("All");
      onCategory?.(id);
    },
    [onCategory]
  );

  const handleSubcategory = useCallback(
    (id: string, name: string) => {
      setSelectedSub(name);
      onSubcategory?.(id);
    },
    [onSubcategory]
  );

  /* ---------- CLEAR EVERYTHING ---------- 
  const handleClear = useCallback(() => {
    setQueryText("");
    setMinInput("");
    setMaxInput("");

    setSelectedCategoryId("All");
    setSelectedCategoryName("All");
    setSelectedSub("All");
    setSubcategories([{ id: "All", name: "All" }]);

    setSelectedSort("none");

    onSearch?.("");
    onCategory?.("All");
    onSubcategory?.("All");
    onMin?.(null);
    onMax?.(null);
    onClear?.();
    onSortChange?.("none");

    setOpenFilters(false);

    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [
    onSearch,
    onCategory,
    onSubcategory,
    onMin,
    onMax,
    onClear,
    onSortChange,
    animatedHeight,
  ]);

  /* ---------- FILTER PANEL TOGGLE ---------- 
  const toggleFilters = useCallback(() => {
    const toValue = openFilters
      ? 0
      : Math.min(contentHeight.current, screenHeight * 0.65);

    Animated.timing(animatedHeight, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();

    setOpenFilters((prev) => !prev);
  }, [openFilters, animatedHeight, screenHeight]);

  /* ---------- LOAD CATEGORIES ---------- 
  useEffect(() => {
    async function loadCategories() {
      const snap = await getDocs(collection(db, "categories"));
      setCategories([
        { id: "All", name: "All" },
        ...snap.docs.map((d) => ({ id: d.id, name: d.data().name })),
      ]);
    }
    loadCategories();
  }, []);

  /* ---------- LOAD SUBCATEGORIES ---------- 
  useEffect(() => {
    async function loadSub() {
      if (selectedCategoryId === "All") {
        setSubcategories([{ id: "All", name: "All" }]);
        handleSubcategory("All", "All");
        return;
      }

      const q = query(
        collection(db, "subcategories"),
        where("categoryId", "==", selectedCategoryId)
      );

      const snap = await getDocs(q);

      setSubcategories([
        { id: "All", name: "All" },
        ...snap.docs.map((d) => ({ id: d.id, name: d.data().name })),
      ]);
    }

    loadSub();
  }, [selectedCategoryId, handleSubcategory]);

  /* ---------- KEYBOARD HANDLING ---------- 
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(animatedHeight, {
        toValue: screenHeight - e.endCoordinates.height - 200,
        duration: 150,
        useNativeDriver: false,
      }).start();
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(animatedHeight, {
        toValue: openFilters
          ? Math.min(contentHeight.current, screenHeight * 0.65)
          : 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, [animatedHeight, openFilters, screenHeight]);

  /* -------------------------------- RENDER -------------------------------- 

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor:
            Platform.OS === "web"
              ? isDark
                ? "#111"
                : "#232f3e"
              : "transparent", // << FIXED: No black on mobile
        },
      ]}
    >
      {/* SEARCH BAR *
      <View style={[styles.searchRow, { backgroundColor: theme.bg }]}>
        <Ionicons name="search" size={20} color={theme.text} />

        <TextInput
          placeholder="Search products…"
          placeholderTextColor={isDark ? "#bbb" : "#666"}
          value={queryText}
          onChangeText={handleSearchText}
          style={[styles.input, { color: theme.text }]}
        />

        <TouchableOpacity style={styles.filterButton} onPress={toggleFilters}>
          <Ionicons name="options-outline" size={22} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, { marginLeft: 6 }]}
          onPress={() => setSortOpen(true)}
        >
          <Ionicons name="swap-vertical-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* FILTER PANEL *
      <Animated.View
        style={[
          styles.animatedBox,
          {
            height: animatedHeight,
            backgroundColor: theme.bg,
            minHeight: openFilters ? 260 : 0,
            maxHeight: screenHeight * 0.65,
            ...(Platform.OS === "web"
              ? { maxWidth: 600, alignSelf: "center", width: "100%" }
              : {}),
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View
            style={{ flex: 1 }}
            onLayout={(e) => {
              contentHeight.current = e.nativeEvent.layout.height;
              if (openFilters) {
                animatedHeight.setValue(
                  Math.min(contentHeight.current, screenHeight * 0.65)
                );
              }
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 150 }}
            >
              {/* CATEGORY *
              <Text style={[styles.label, { color: theme.text }]}>
                Category
              </Text>
              <View style={styles.rowWrap}>
                {categories.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    selected={c.name === selectedCategoryName}
                    theme={theme}
                    onPress={() => handleCategory(c.id, c.name)}
                  />
                ))}
              </View>

              {/* SUBCATEGORY *
              <Text style={[styles.label, { color: theme.text }]}>
                Subcategory
              </Text>
              <View style={styles.rowWrap}>
                {subcategories.map((s) => (
                  <Chip
                    key={s.id}
                    label={s.name}
                    selected={s.name === selectedSub}
                    theme={theme}
                    onPress={() => handleSubcategory(s.id, s.name)}
                  />
                ))}
              </View>

              {/* PRICE RANGE *
              <Text style={[styles.label, { color: theme.text }]}>
                Price Range
              </Text>

              <View style={styles.priceRow}>
                <TextInput
                  placeholder="Min"
                  placeholderTextColor="#999"
                  value={minInput}
                  onChangeText={(v) => {
                    setMinInput(v);
                    onMin?.(v ? Number(v) : null);
                  }}
                  keyboardType="numeric"
                  style={[
                    styles.priceInput,
                    {
                      backgroundColor: theme.inputBg,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                />

                <TextInput
                  placeholder="Max"
                  placeholderTextColor="#999"
                  value={maxInput}
                  onChangeText={(v) => {
                    setMaxInput(v);
                    onMax?.(v ? Number(v) : null);
                  }}
                  keyboardType="numeric"
                  style={[
                    styles.priceInput,
                    {
                      backgroundColor: theme.inputBg,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </View>
            </ScrollView>

            {/* ACTION BAR *
            <View style={styles.actionBar}>
              <TouchableOpacity
                onPress={handleClear}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleFilters}
                style={styles.applyButton}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>

      {/* SORT MENU *
      <SortMenu
        visible={sortOpen}
        selected={selectedSort}
        onClose={() => setSortOpen(false)}
        onSelect={(sort: SortOption) => {
          setSelectedSort(sort);
          onSortChange?.(sort);
        }}
      />
    </View>
  );
}

/* ---------- CHIP COMPONENT ---------- 
function Chip({ label, selected, onPress, theme }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.chipSelected : theme.chipBg,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: selected ? "#000" : theme.text,
            fontWeight: selected ? "700" : "500",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ---------- STYLES ---------- 
const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
  },
  animatedBox: {
    overflow: "hidden",
    borderRadius: 20,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 18,
    paddingHorizontal: 16,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    rowGap: 10,
    columnGap: 10,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  chipText: {
    fontSize: 14,
  },
  priceRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  actionBar: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    left: "5%",
    right: "5%",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: "hidden",
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#ffecec",
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "red",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#FFD814",
    justifyContent: "center",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
});
*/

import { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Text,
  Platform,
  Animated,
  ScrollView,
  useColorScheme,
  Keyboard,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";

import { Icon } from "@/src/components/icons/Icon";
import { db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import SortMenu, { SortOption } from "./SortMenu";

export default function SearchBar({
  onSearch,
  onCategory,
  onSubcategory,
  onMin,
  onMax,
  onClear,
  onSortChange,
}: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  /* ---------- THEME ---------- */
  const theme = {
    bg: isDark ? "#1a1a1a" : "#ffffff",
    text: isDark ? "#f2f2f2" : "#222",
    chipBg: isDark ? "#333" : "#f2f2f2",
    chipSelected: "#FFD814",
    border: isDark ? "#444" : "#ddd",
    inputBg: isDark ? "#2a2a2a" : "#f7f7f7",
  };

  /* ---------- STATE ---------- */
  const [queryText, setQueryText] = useState("");

  const [categories, setCategories] = useState([{ id: "All", name: "All" }]);
  const [subcategories, setSubcategories] = useState([
    { id: "All", name: "All" },
  ]);

  const [selectedCategoryId, setSelectedCategoryId] = useState("All");
  const [selectedCategoryName, setSelectedCategoryName] = useState("All");
  const [selectedSub, setSelectedSub] = useState("All");

  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");

  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>("none");

  const [openFilters, setOpenFilters] = useState(false);

  /* ---------- ANIMATION ---------- */
  const screenHeight = Dimensions.get("window").height;
  const contentHeight = useRef(0);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  /* ---------- INPUT HANDLERS ---------- */
  const handleSearchText = useCallback(
    (text: string) => {
      setQueryText(text);
      onSearch?.(text);
    },
    [onSearch]
  );

  const handleCategory = useCallback(
    (id: string, name: string) => {
      setSelectedCategoryId(id);
      setSelectedCategoryName(name);
      setSelectedSub("All");
      onCategory?.(id);
    },
    [onCategory]
  );

  const handleSubcategory = useCallback(
    (id: string, name: string) => {
      setSelectedSub(name);
      onSubcategory?.(id);
    },
    [onSubcategory]
  );

  /* ---------- CLEAR EVERYTHING ---------- */
  const handleClear = useCallback(() => {
    setQueryText("");
    setMinInput("");
    setMaxInput("");

    setSelectedCategoryId("All");
    setSelectedCategoryName("All");
    setSelectedSub("All");
    setSubcategories([{ id: "All", name: "All" }]);

    setSelectedSort("none");

    onSearch?.("");
    onCategory?.("All");
    onSubcategory?.("All");
    onMin?.(null);
    onMax?.(null);
    onClear?.();
    onSortChange?.("none");

    setOpenFilters(false);

    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [
    onSearch,
    onCategory,
    onSubcategory,
    onMin,
    onMax,
    onClear,
    onSortChange,
    animatedHeight,
  ]);

  /* ---------- FILTER PANEL TOGGLE ---------- */
  const toggleFilters = useCallback(() => {
    const toValue = openFilters
      ? 0
      : Math.min(contentHeight.current, screenHeight * 0.65);

    Animated.timing(animatedHeight, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();

    setOpenFilters((prev) => !prev);
  }, [openFilters, animatedHeight, screenHeight]);

  /* ---------- LOAD CATEGORIES ---------- */
  useEffect(() => {
    async function loadCategories() {
      const snap = await getDocs(collection(db, "categories"));
      setCategories([
        { id: "All", name: "All" },
        ...snap.docs.map((d) => ({ id: d.id, name: d.data().name })),
      ]);
    }
    loadCategories();
  }, []);

  /* ---------- LOAD SUBCATEGORIES ---------- */
  useEffect(() => {
    async function loadSub() {
      if (selectedCategoryId === "All") {
        setSubcategories([{ id: "All", name: "All" }]);
        handleSubcategory("All", "All");
        return;
      }

      const q = query(
        collection(db, "subcategories"),
        where("categoryId", "==", selectedCategoryId)
      );

      const snap = await getDocs(q);

      setSubcategories([
        { id: "All", name: "All" },
        ...snap.docs.map((d) => ({ id: d.id, name: d.data().name })),
      ]);
    }

    loadSub();
  }, [selectedCategoryId, handleSubcategory]);

  /* ---------- KEYBOARD HANDLING ---------- */
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(animatedHeight, {
        toValue: screenHeight - e.endCoordinates.height - 200,
        duration: 150,
        useNativeDriver: false,
      }).start();
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(animatedHeight, {
        toValue: openFilters
          ? Math.min(contentHeight.current, screenHeight * 0.65)
          : 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, [animatedHeight, openFilters, screenHeight]);

  /* -------------------------------- RENDER -------------------------------- */
  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor:
            Platform.OS === "web"
              ? isDark
                ? "#111"
                : "#232f3e"
              : "transparent",
        },
      ]}
    >
      {/* SEARCH BAR */}
      <View style={[styles.searchRow, { backgroundColor: theme.bg }]}>
        <Icon name="search" size={20} color={theme.text} />

        <TextInput
          placeholder="Search products…"
          placeholderTextColor={isDark ? "#bbb" : "#666"}
          value={queryText}
          onChangeText={handleSearchText}
          style={[styles.input, { color: theme.text }]}
        />

        <TouchableOpacity style={styles.filterButton} onPress={toggleFilters}>
          <Icon name="options-outline" size={22} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, { marginLeft: 6 }]}
          onPress={() => setSortOpen(true)}
        >
          <Icon name="swap-vertical-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* FILTER PANEL */}
      <Animated.View
        style={[
          styles.animatedBox,
          {
            height: animatedHeight,
            backgroundColor: theme.bg,
            minHeight: openFilters ? 260 : 0,
            maxHeight: screenHeight * 0.65,
            ...(Platform.OS === "web"
              ? { maxWidth: 600, alignSelf: "center", width: "100%" }
              : {}),
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View
            style={{ flex: 1 }}
            onLayout={(e) => {
              contentHeight.current = e.nativeEvent.layout.height;
              if (openFilters) {
                animatedHeight.setValue(
                  Math.min(contentHeight.current, screenHeight * 0.65)
                );
              }
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 150 }}
            >
              {/* CATEGORY */}
              <Text style={[styles.label, { color: theme.text }]}>
                Category
              </Text>
              <View style={styles.rowWrap}>
                {categories.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    selected={c.name === selectedCategoryName}
                    theme={theme}
                    onPress={() => handleCategory(c.id, c.name)}
                  />
                ))}
              </View>

              {/* SUBCATEGORY */}
              <Text style={[styles.label, { color: theme.text }]}>
                Subcategory
              </Text>
              <View style={styles.rowWrap}>
                {subcategories.map((s) => (
                  <Chip
                    key={s.id}
                    label={s.name}
                    selected={s.name === selectedSub}
                    theme={theme}
                    onPress={() => handleSubcategory(s.id, s.name)}
                  />
                ))}
              </View>

              {/* PRICE RANGE */}
              <Text style={[styles.label, { color: theme.text }]}>
                Price Range
              </Text>

              <View style={styles.priceRow}>
                <TextInput
                  placeholder="Min"
                  placeholderTextColor="#999"
                  value={minInput}
                  onChangeText={(v) => {
                    setMinInput(v);
                    onMin?.(v ? Number(v) : null);
                  }}
                  keyboardType="numeric"
                  style={[
                    styles.priceInput,
                    {
                      backgroundColor: theme.inputBg,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                />

                <TextInput
                  placeholder="Max"
                  placeholderTextColor="#999"
                  value={maxInput}
                  onChangeText={(v) => {
                    setMaxInput(v);
                    onMax?.(v ? Number(v) : null);
                  }}
                  keyboardType="numeric"
                  style={[
                    styles.priceInput,
                    {
                      backgroundColor: theme.inputBg,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </View>
            </ScrollView>

            {/* ACTION BAR */}
            <View style={styles.actionBar}>
              <TouchableOpacity
                onPress={handleClear}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleFilters}
                style={styles.applyButton}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>

      {/* SORT MENU */}
      <SortMenu
        visible={sortOpen}
        selected={selectedSort}
        onClose={() => setSortOpen(false)}
        onSelect={(sort: SortOption) => {
          setSelectedSort(sort);
          onSortChange?.(sort);
        }}
      />
    </View>
  );
}

/* ---------- CHIP COMPONENT ---------- */
function Chip({ label, selected, onPress, theme }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.chipSelected : theme.chipBg,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: selected ? "#000" : theme.text,
            fontWeight: selected ? "700" : "500",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
  },
  animatedBox: {
    overflow: "hidden",
    borderRadius: 20,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 18,
    paddingHorizontal: 16,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    rowGap: 10,
    columnGap: 10,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  chipText: {
    fontSize: 14,
  },
  priceRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  actionBar: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    left: "5%",
    right: "5%",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: "hidden",
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#ffecec",
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "red",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#FFD814",
    justifyContent: "center",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
});
