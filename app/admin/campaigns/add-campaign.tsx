import { router } from "expo-router";
import React, { useState } from "react";
import {
  Button,
  Image,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import ProductMultiSelect from "../../../src/components/admin/ProductMultiSelect";
import { createCampaign } from "../../../src/services/campaignService";
import { uploadImageAsync } from "../../../src/services/uploadService";
import { pickImage } from "../../../src/utils/pickImage";

export default function AddCampaignPage() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [banner, setBanner] = useState<string | null>(null);

  const [productIds, setProductIds] = useState<string[]>([]);

  // Campaign Type & Dynamic Configuration
  const [type, setType] = useState("");
  const [config, setConfig] = useState<any>({});

  async function chooseBanner() {
    const uri = await pickImage();
    if (uri) setBanner(uri);
  }

  async function save() {
    if (!title.trim()) return alert("Enter a title");
    if (!banner) return alert("Pick a banner");
    if (!type) return alert("Select a campaign type");

    const id = Date.now().toString();

    const bannerUrl = await uploadImageAsync(
      banner,
      `campaigns/${id}/banner.jpg`
    );

    await createCampaign(
      id,
      {
        title,
        subtitle,
        productIds,
        type,
        config,
      },
      bannerUrl
    );

    alert("Campaign created successfully");
    router.push("/admin/campaigns");
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Create Campaign</Text>

      {/* Title */}
      <Text style={styles.label}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholder="Black Friday Sale"
      />

      {/* Subtitle */}
      <Text style={styles.label}>Subtitle</Text>
      <TextInput
        value={subtitle}
        onChangeText={setSubtitle}
        style={styles.input}
        placeholder="Up to 50% OFF"
      />

      {/* Banner */}
      <Button title="Pick Banner" onPress={chooseBanner} />

      {banner && (
        <Image source={{ uri: banner }} style={styles.bannerPreview} />
      )}

      {/* Product Multi Select */}
      <Text style={styles.label}>Select Products</Text>
      <ProductMultiSelect selected={productIds} onChange={setProductIds} />

      {/* Campaign Type Picker */}
      <Text style={styles.label}>Campaign Type</Text>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={type}
          onValueChange={(value) => {
            setType(value);
            setConfig({});
          }}
          style={styles.picker}
        >
          <Picker.Item label="Select Type" value="" />
          <Picker.Item label="Buy X Get Y% Off" value="BUY_X_GET_Y_PERCENT" />
          <Picker.Item label="First Purchase Discount" value="FIRST_PURCHASE_DISCOUNT" />
          <Picker.Item label="Spend & Save" value="SPEND_AND_SAVE" />
          <Picker.Item label="BOGO (Buy X Get Y Free)" value="BOGO" />
          <Picker.Item label="Flash Sale" value="FLASH_SALE" />
          <Picker.Item label="Quantity Discount" value="QUANTITY_DISCOUNT" />
        </Picker>
      </View>

      {/* Dynamic Fields */}
      {type === "BUY_X_GET_Y_PERCENT" && (
        <>
          <Text style={styles.label}>Buy Quantity</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              setConfig({ ...config, buyQuantity: Number(v) })
            }
            placeholder="Example: 3"
          />

          <Text style={styles.label}>Discount %</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              setConfig({ ...config, discountPercent: Number(v) })
            }
            placeholder="Example: 10"
          />
        </>
      )}

      {type === "FIRST_PURCHASE_DISCOUNT" && (
        <>
          <Text style={styles.label}>Discount % for first order</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              setConfig({ ...config, discountPercent: Number(v) })
            }
            placeholder="Example: 50"
          />
        </>
      )}

      {type === "SPEND_AND_SAVE" && (
        <>
          <Text style={styles.label}>Minimum Spend ($)</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              setConfig({ ...config, minAmount: Number(v) })
            }
            placeholder="Example: 100"
          />

          <Text style={styles.label}>Discount Amount ($)</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              setConfig({ ...config, discountAmount: Number(v) })
            }
            placeholder="Example: 20"
          />
        </>
      )}

      {type === "BOGO" && (
        <>
          <Text style={styles.label}>Buy X</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) => setConfig({ ...config, buy: Number(v) })}
            placeholder="Example: 1"
          />

          <Text style={styles.label}>Get Y Free</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              setConfig({ ...config, getFree: Number(v) })
            }
            placeholder="Example: 1"
          />
        </>
      )}

      {type === "FLASH_SALE" && (
        <>
          <Text style={styles.label}>Discount %</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              setConfig({ ...config, discountPercent: Number(v) })
            }
            placeholder="Example: 40"
          />

          <Text style={styles.label}>Start Time (timestamp)</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              setConfig({ ...config, startAt: Number(v) })
            }
            placeholder="e.g. 1700000000"
          />

          <Text style={styles.label}>End Time (timestamp)</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              setConfig({ ...config, endAt: Number(v) })
            }
            placeholder="e.g. 1700086400"
          />
        </>
      )}

      {type === "QUANTITY_DISCOUNT" && (
        <>
          <Text style={styles.label}>Minimum Quantity</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              setConfig({ ...config, minQuantity: Number(v) })
            }
            placeholder="Example: 5"
          />

          <Text style={styles.label}>Discount %</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              setConfig({ ...config, discountPercent: Number(v) })
            }
            placeholder="Example: 30"
          />
        </>
      )}

      <Button title="Create Campaign" onPress={save} />
    </ScrollView>
  );
}

/* -------------------------------------------------------- */
/*                         STYLES                           */
/* -------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  label: {
    marginTop: 15,
    fontWeight: "600",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    fontSize: 14,
  },
  bannerPreview: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginTop: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginVertical: 10,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
});
