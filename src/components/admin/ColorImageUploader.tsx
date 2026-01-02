/*
import React from "react";
import { Button, Image, TextInput, View } from "react-native";
import { pickImage } from "../../utils/pickImage";

// 1) Define the type for one image item
export interface ColorImage {
  uri: string;
  color: string;
}

// 2) Define props for the uploader component
interface Props {
  images: ColorImage[];
  setImages: (imgs: ColorImage[]) => void;
}

export default function ColorImageUploader({ images, setImages }: Props) {
  async function addImage() {
    if (images.length >= 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    const uri = await pickImage();
    if (!uri) return;

    setImages([...images, { uri, color: "" }]);
  }

  function updateColor(index: number, color: string) {
    const updated = [...images];
    updated[index].color = color;
    setImages(updated);
  }

  return (
    <View style={{ marginTop: 20 }}>
      <Button title="Add Image (with color)" onPress={addImage} />

      {images.map((img, index) => (
        <View key={index} style={{ marginTop: 10 }}>
          <Image
            source={{ uri: img.uri }}
            style={{ width: 120, height: 120, borderRadius: 10 }}
          />

          <TextInput
            placeholder="Color (e.g. red)"
            value={img.color}
            onChangeText={(t) => updateColor(index, t)}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              marginTop: 10,
              padding: 8,
              borderRadius: 8,
            }}
          />
        </View>
      ))}
    </View>
  );
}
*/
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
} from "react-native";

/* --------------------------------------------------
   TYPES
-------------------------------------------------- */
export type ColorImageGroup = {
  color: string;
  images: string[];
};

type Props = {
  groups: ColorImageGroup[];
  setGroups: React.Dispatch<React.SetStateAction<ColorImageGroup[]>>;
  maxPerColor?: number;
};

/* --------------------------------------------------
   COMPONENT
-------------------------------------------------- */
export default function ColorImageUploader({
  groups,
  setGroups,
  maxPerColor = 5,
}: Props) {
  /* -------------------------------
     PICK IMAGES
  -------------------------------- */
  async function pickImages(index: number) {
    const group = groups[index];

    // 🚫 Block image picking if color is missing
    if (!group.color.trim()) {
      alert("Please enter a color before adding images.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      selectionLimit: maxPerColor,
      quality: 0.9,
    });

    if (res.canceled || !res.assets?.length) return;

    const incomingUris = res.assets.map((a) => a.uri);

    setGroups((prev) => {
      const copy = [...prev];
      const existing = copy[index].images.length;

      const allowed = incomingUris.slice(0, maxPerColor - existing);

      copy[index] = {
        ...copy[index],
        images: [...copy[index].images, ...allowed],
      };

      return copy;
    });
  }

  /* -------------------------------
     ADD COLOR GROUP
  -------------------------------- */
  function addColor() {
    setGroups((prev) => [...prev, { color: "", images: [] }]);
  }

  /* -------------------------------
     UPDATE COLOR
  -------------------------------- */
  function updateColor(index: number, value: string) {
    setGroups((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], color: value };
      return copy;
    });
  }

  /* -------------------------------
     REMOVE IMAGE
  -------------------------------- */
  function removeImage(groupIndex: number, imageIndex: number) {
    setGroups((prev) => {
      const copy = [...prev];
      copy[groupIndex] = {
        ...copy[groupIndex],
        images: copy[groupIndex].images.filter((_, i) => i !== imageIndex),
      };
      return copy;
    });
  }

  return (
    <View>
      {groups.map((group, index) => (
        <View key={index} style={styles.group}>
          <Text style={styles.label}>Color</Text>

          <TextInput
            value={group.color}
            onChangeText={(text) => updateColor(index, text)}
            placeholder="e.g. Red, Black, Blue"
            style={[styles.colorInput, !group.color && styles.errorInput]}
          />

          {!group.color && (
            <Text style={styles.errorText}>Color is required</Text>
          )}

          <Pressable
            style={[
              styles.addBtn,
              group.images.length >= maxPerColor && styles.disabledBtn,
            ]}
            onPress={() => pickImages(index)}
            disabled={group.images.length >= maxPerColor}
          >
            <Text style={styles.addText}>
              Add Images ({group.images.length}/{maxPerColor})
            </Text>
          </Pressable>

          {/* IMAGE PREVIEW */}
          {group.images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 14 }}
            >
              {group.images.map((uri, i) => (
                <View key={i} style={styles.imageWrap}>
                  <Image source={{ uri }} style={styles.image} />
                  <Pressable
                    style={styles.removeBtn}
                    onPress={() => removeImage(index, i)}
                  >
                    <Text style={styles.removeText}>×</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      ))}

      <Pressable style={styles.addColorBtn} onPress={addColor}>
        <Text style={styles.addColorText}>+ Add Color</Text>
      </Pressable>
    </View>
  );
}

/* --------------------------------------------------
   STYLES
-------------------------------------------------- */
const styles = StyleSheet.create({
  group: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  label: {
    fontWeight: "800",
    marginBottom: 6,
  },
  colorInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 12,
    fontWeight: "600",
  },
  errorInput: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    fontWeight: "600",
  },
  addBtn: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  addText: {
    color: "white",
    fontWeight: "900",
  },
  imageWrap: {
    position: "relative",
    marginRight: 12,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 14,
    backgroundColor: "#e5e7eb",
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#ef4444",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: "white",
    fontWeight: "900",
    fontSize: 14,
    lineHeight: 14,
  },
  addColorBtn: {
    marginTop: 10,
    backgroundColor: "#e67e22",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
  },
  addColorText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },
});
