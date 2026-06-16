// src/components/ProductCard.js
import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useCart } from "../context/CartContext";

/**
 * ProductCard: compact card used in the Market grid.
 * Props: product, onPress
 */

export default function ProductCard({ product, onPress }) {
  const { addToCart } = useCart();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <TouchableOpacity style={[styles.card, isDesktop ? styles.cardDesktop : null]} onPress={() => onPress?.(product)}>
      <Image source={{ uri: product.image }} style={[styles.image, isDesktop ? styles.imageDesktop : null]} />
      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.title}>
          {product.title}
        </Text>
        <View style={styles.row}>
          <Text style={styles.price}>${product.price}</Text>
          <TouchableOpacity onPress={() => addToCart(product)} style={styles.addBtn}>
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    margin: 6,
    width: "48%",
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardDesktop: {
    width: '19%',
    margin: 8,
  },
  image: { width: "100%", height: 140, backgroundColor: "#eee" },
  imageDesktop: { height: 180 },
  meta: { padding: 10 },
  title: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { fontSize: 14, fontWeight: "700" },
  addBtn: { backgroundColor: "#000", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  addText: { color: "#fff", fontWeight: "700" },
});