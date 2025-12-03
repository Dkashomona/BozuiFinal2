import { router, useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import ProductMultiSelect from "../../../../src/components/admin/ProductMultiSelect";
import { db } from "../../../../src/services/firebase";
import { uploadImageAsync } from "../../../../src/services/uploadService";
import { pickImage } from "../../../../src/utils/pickImage";

const { width } = Dimensions.get("window");

export default function EditCampaignPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState("");
  const [productIds, setProductIds] = useState<string[]>([]);

  // Memoized loader → fixes missing dependency warning
  const loadCampaign = useCallback(async () => {
    if (!id) return;

    const ref = doc(db, "campaigns", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("Campaign not found.");
      return router.back();
    }

    const data: any = snap.data();
    setTitle(data.title);
    setSubtitle(data.subtitle);
    setBannerUrl(data.bannerImage);
    setProductIds(data.productIds ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  async function pickNewBanner() {
    const uri = await pickImage();
    if (uri) setBanner(uri);
  }

  async function save() {
    if (!id) return;

    let finalBannerUrl = bannerUrl;

    // Upload new banner if selected
    if (banner) {
      finalBannerUrl = await uploadImageAsync(
        banner,
        `campaigns/${id}/banner.jpg`
      );
    }

    await updateDoc(doc(db, "campaigns", id), {
      title,
      subtitle,
      bannerImage: finalBannerUrl,
      productIds,
      updatedAt: new Date(),
    });

    alert("Campaign updated!");
    router.back();
  }

  if (loading) {
    return (
      <View style={{ padding: 30 }}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Edit Campaign</Text>

      <Text style={{ marginTop: 15 }}>Title</Text>
      <TextInput value={title} onChangeText={setTitle} style={input} />

      <Text>Subtitle</Text>
      <TextInput value={subtitle} onChangeText={setSubtitle} style={input} />

      <Text>Banner</Text>

      <Image
        source={{ uri: banner ? banner : bannerUrl }}
        style={{
          width: width - 40,
          height: 180,
          borderRadius: 12,
          resizeMode: "cover",
          alignSelf: "center",
          marginVertical: 10,
        }}
      />

      <Button title="Change Banner" onPress={pickNewBanner} />

      <ProductMultiSelect selected={productIds} onChange={setProductIds} />

      <View style={{ marginTop: 20 }}>
        <Button title="Save Changes" onPress={save} />
      </View>
    </ScrollView>
  );
}

const input = {
  borderWidth: 1,
  borderColor: "#ccc",
  padding: 10,
  borderRadius: 8,
  marginVertical: 10,
};
