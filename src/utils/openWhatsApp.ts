import { Linking, Platform } from "react-native";

export function openWhatsApp(adminNumber: string, message: string) {
  const encoded = encodeURIComponent(message);

  const url =
    Platform.OS === "web"
      ? `https://wa.me/${adminNumber}?text=${encoded}`
      : `whatsapp://send?phone=${adminNumber}&text=${encoded}`;

  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://wa.me/${adminNumber}?text=${encoded}`);
  });
}
