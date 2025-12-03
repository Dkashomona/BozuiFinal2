import * as ImagePicker from "expo-image-picker";

export async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 0.8,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }

  return null;
}
