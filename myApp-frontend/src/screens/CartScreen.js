import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppHeader from "../components/AppHeader";
import { useCart } from "../context/CartContext";

export default function CartScreen({ navigation }) {
  const { cartItems, removeFromCart, total, clearCart } = useCart();

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Your Cart"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
      />

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty 🛍️</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.qty}>Qty: {item.quantity}</Text>
                <Text style={styles.price}>${item.price * item.quantity}</Text>
                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Text style={styles.remove}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />

          <View style={styles.footer}>
            <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
            <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
              <Text style={styles.clearText}>Clear Cart</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 16, color: "#888" },
  item: {
    borderBottomWidth: 1,
    borderColor: "#eee",
    padding: 16,
  },
  title: { fontSize: 16, fontWeight: "600" },
  qty: { color: "#777" },
  price: { fontWeight: "600", marginTop: 4 },
  remove: { color: "red", marginTop: 6 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  total: { fontWeight: "700", fontSize: 16 },
  clearBtn: { backgroundColor: "#007AFF", padding: 10, borderRadius: 8 },
  clearText: { color: "#fff", fontWeight: "700" },
});