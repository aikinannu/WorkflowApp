// src/context/MarketContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { marketplace } from "../api/apiClient";

/**
 * MarketContext backed by gd backend marketplace service.
 */

const MarketContext = createContext();

const FALLBACK_PRODUCTS = [
  { id: "1", title: "Streetwear Hoodie", price: 45, category: "Clothing", brand: "Godemar", image: "https://placehold.co/400x400?text=Hoodie" },
  { id: "2", title: "Afrobeats Vinyl", price: 30, category: "Music", brand: "VinylCo", image: "https://placehold.co/400x400?text=Vinyl" },
  { id: "3", title: "Designer Cap", price: 25, category: "Accessories", brand: "SnapStyle", image: "https://placehold.co/400x400?text=Cap" },
  { id: "4", title: "Graphic Tee", price: 20, category: "Clothing", brand: "Godemar", image: "https://placehold.co/400x400?text=Tee" },
  { id: "5", title: "Limited Sneakers", price: 120, category: "Footwear", brand: "StepUp", image: "https://placehold.co/400x400?text=Sneakers" },
];

export function MarketProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: "All",
    priceRange: [0, 1000],
    brand: "All",
    sortBy: "relevance", // relevance | price_asc | price_desc | newest
  });
  const [loading, setLoading] = useState(false);

  // load products when filters change (also runs on mount)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await marketplace.listProducts(filters);
        const result = Array.isArray(response) ? response : response.items ?? [];
        if (mounted) setProducts(result);
      } catch (e) {
        console.warn("fetchProducts error", e);
        if (mounted) setProducts(FALLBACK_PRODUCTS);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [filters]);

  const fetchProducts = async (appliedFilters = filters) => {
    setLoading(true);
    try {
      const response = await marketplace.listProducts(appliedFilters);
      const result = Array.isArray(response) ? response : response.items ?? [];
      setProducts(result);
    } catch (e) {
      console.warn("fetchProducts error", e);
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = (product) => {
    if (!product) return;
    setProducts((prev) => [product, ...prev]);
  };

  const applyFilters = (newFilters) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
    fetchProducts(merged);
  };

  const clearFilters = () => {
    const defaults = { category: "All", priceRange: [0, 1000], brand: "All", sortBy: "relevance" };
    setFilters(defaults);
    fetchProducts(defaults);
  };

  return (
    <MarketContext.Provider
      value={{
        products,
        filters,
        loading,
        setFilters,
        applyFilters,
        clearFilters,
        fetchProducts,
        addProduct,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
}

export const useMarket = () => useContext(MarketContext);
export default MarketContext;