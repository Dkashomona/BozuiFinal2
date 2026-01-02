import { View, Text, StyleSheet } from "react-native";

export default function ProductSpecs({ product }: any) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Product Details</Text>

      {product.description ? (
        <Text style={styles.description}>{product.description}</Text>
      ) : null}

      <View style={styles.specBlock}>
        <Text style={styles.specTitle}>Specifications</Text>

        {product.stock != null && (
          <Text style={styles.specItem}>Stock: {product.stock} units</Text>
        )}

        {product.weight != null && (
          <Text style={styles.specItem}>Weight: {product.weight} kg</Text>
        )}

        {product.material != null && (
          <Text style={styles.specItem}>Material: {product.material}</Text>
        )}

        {product.dimensions != null && (
          <Text style={styles.specItem}>Dimensions: {product.dimensions}</Text>
        )}
      </View>

      {product.features &&
        Array.isArray(product.features) &&
        product.features.length > 0 && (
          <View style={styles.specBlock}>
            <Text style={styles.specTitle}>Key Features</Text>
            {product.features.map((f: string, idx: number) =>
              f ? (
                <Text style={styles.bullet} key={idx}>
                  • {f}
                </Text>
              ) : null
            )}
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 25,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  specBlock: { marginTop: 10 },
  specTitle: { fontSize: 17, fontWeight: "700", marginBottom: 6 },
  specItem: { fontSize: 14, color: "#555", marginBottom: 4 },
  bullet: { fontSize: 14, marginLeft: 8, marginBottom: 4 },
});
