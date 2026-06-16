// src/screens/MarketScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AppHeader from "../components/AppHeader";
import FilterModal from "../components/FilterModal";
import { useCart } from "../context/CartContext";
import { useMarket } from "../context/MarketContext";

export default function MarketScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const { products, loading, filters, applyFilters, fetchProducts } = useMarket();
  const { addToCart } = useCart();
  const [filterVisible, setFilterVisible] = useState(false);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts(filters);
    }, [fetchProducts, filters])
  );

  

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Market"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        rightIcons={[
          {
            name: "search-outline",
            onPress: () =>
              navigation.navigate("Search", { source: "market" }), // ✅ Pass source
          },
          {
            name: "filter-outline",
            onPress: () => setFilterVisible(true),
          },
          {
            name: "cart-outline",
            onPress: () => navigation.navigate("CartScreen"),
          },
        ]}
      />

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
        ) : products.length > 0 ? (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            key={isDesktop ? "desktop" : "mobile"}
            numColumns={isDesktop ? 5 : 2}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ProductDetailScreen", { product: item })
                }
                style={[styles.productCard, isDesktop ? styles.productCardDesktop : null]}
              >
                <Image source={{ uri: item.image }} style={[styles.image, isDesktop ? styles.imageDesktop : null]} />
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.price}>${item.price}</Text>
                <TouchableOpacity
                  onPress={() => handleAddToCart(item)}
                  style={styles.cartButton}
                >
                  <Ionicons name="cart-outline" size={18} color="#fff" />
                  <Text style={styles.cartButtonText}>Add to Cart</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.empty}>No products found.</Text>
        )}
      </View>

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        initialFilters={filters}
        onApply={applyFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, paddingHorizontal: 12, paddingTop: 12 },
  grid: { paddingBottom: 100 },
  productCard: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    margin: 8,
    padding: 12,
    alignItems: "center",
    elevation: 2,
  },
  productCardDesktop: {
    width: '19%',
    margin: 10,
    padding: 14,
  },
  image: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    resizeMode: "cover",
  },
  imageDesktop: { height: 160 },
  title: { fontSize: 14, fontWeight: "600", color: "#333", marginTop: 8 },
  price: { fontSize: 13, color: "#555", marginTop: 4 },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  cartButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 40,
  },
});