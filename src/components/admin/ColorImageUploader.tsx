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
