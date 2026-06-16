import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { marketplace } from "../api/apiClient";

export default function ProductDetailScreen({ route, navigation }) {
  const { product: routeProduct } = route.params;
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(routeProduct);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      if (product?.id || product?.product_id || !routeProduct) {
        return;
      }
      if (!routeProduct?.id) {
        return;
      }

      setLoading(true);
      try {
        const result = await marketplace.getProduct(routeProduct.id);
        setProduct(result);
      } catch (error) {
        console.warn("Failed to load product details", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [routeProduct, product]);

  const productId = product?.id || product?.product_id;
  const handleBuyNow = async () => {
    if (!user?.tenant_id) {
      alert("Please sign in to complete purchases.");
      return;
    }

    if (!productId) {
      alert("Unable to purchase product, missing product ID.");
      return;
    }

    setBuying(true);
    try {
      const payload = { quantity };
      const response = await marketplace.purchaseProduct(productId, payload);
      console.log("Purchase response", response);
      alert(response?.message || "Purchase completed successfully.");
      navigation.navigate("CartScreen");
    } catch (err) {
      console.warn("Purchase failed", err);
      alert(err.message || "Purchase failed. Try again.");
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader
          title="Product Details"
          leftIcon="arrow-back"
          onLeftPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Product Details"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        rightIcons={[
          { name: "cart-outline", onPress: () => navigation.navigate("CartScreen") },
        ]}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Image source={{ uri: product?.image }} style={styles.image} />

        <View style={styles.details}>
          <Text style={styles.title}>{product?.title || "Product"}</Text>
          <Text style={styles.price}>${product?.price ?? "--"}</Text>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {product?.description || "This is a high-quality product available at a great price."}
          </Text>

          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.buyButton}
            onPress={handleBuyNow}
            disabled={buying}
          >
            <Ionicons name="cart-outline" size={18} color="#fff" />
            <Text style={styles.buyText}>{buying ? "Processing..." : "Buy Now"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cartButton, styles.secondaryButton]}
            onPress={() => {
              addToCart(product);
              navigation.navigate("CartScreen");
            }}
          >
            <Ionicons name="cart-outline" size={18} color="#fff" />
            <Text style={styles.cartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { paddingBottom: 50 },
  image: {
    width: "100%",
    height: 320,
    resizeMode: "cover",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  details: { padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 24,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
    borderRadius: 14,
    paddingHorizontal: 10,
  },
  quantityButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007AFF",
  },
  quantityValue: {
    minWidth: 40,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#1d2433",
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34C759",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  buyText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 16,
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: "#0A84FF",
  },
  cartText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 16,
  },
});