// src/context/CartContext.js
import secureStorage from "../utils/secureStorage";
import { createContext, useContext, useEffect, useState } from "react";

/**
 * CartContext with basic persistence via AsyncStorage.
 * - addToCart, removeFromCart, updateQuantity, clearCart
 */

const CartContext = createContext();
const STORAGE_KEY = "@godemar_cart_v1";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await secureStorage.getItem(STORAGE_KEY);
        if (raw) setCartItems(JSON.parse(raw));
      } catch (e) {
        console.warn("CartProvider load error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    secureStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems)).catch((e) =>
      console.warn("Cart persist error", e)
    );
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    setCartItems((prev) => {
      const found = prev.find((p) => p.id === product.id);
      if (found) {
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + qty } : p));
      }
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity } : p)));
  };

  const clearCart = () => setCartItems([]);

  const total = cartItems.reduce((s, p) => s + p.price * p.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, loading, addToCart, removeFromCart, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
export default CartContext;