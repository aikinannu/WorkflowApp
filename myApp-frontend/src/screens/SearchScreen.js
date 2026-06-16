// src/screens/SearchScreen.js
import { useRoute, useNavigation } from "@react-navigation/native";
import { useMemo, useState, useEffect } from "react";
import secureStorage from "../utils/secureStorage";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { marketplaceAPI } from "../api/client";

export default function SearchScreen() {
  const route = useRoute();
  const { source } = route.params || {}; // "home", "reels", "market", "profile"
  const [query, setQuery] = useState("");
  const navigation = useNavigation();
  const [history, setHistory] = useState([]);
  const [savedItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const MAX_HISTORY = 10;

  const STORAGE_KEY = (s) => `search_history_${s || "global"}`;
  
  // Load products from backend for market search
  useEffect(() => {
    if (source === "market") {
      loadProducts();
    }
  }, [source]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await marketplaceAPI.getProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const mountedRef = { current: true };
    const load = async () => {
      try {
        const raw = await secureStorage.getItem(STORAGE_KEY(source));
        const items = raw ? JSON.parse(raw) : [];
        if (mountedRef.current) setHistory(items);
      } catch (e) {
        console.warn("Search history load error", e);
      }
    };
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [source]);

  const saveToHistory = async (term) => {
    if (!term || !term.trim()) return;
    try {
      const key = STORAGE_KEY(source);
      const raw = await secureStorage.getItem(key);
      let arr = raw ? JSON.parse(raw) : [];
      arr = arr.filter((t) => t.toLowerCase() !== term.toLowerCase());
      arr.unshift(term);
      if (arr.length > MAX_HISTORY) arr = arr.slice(0, MAX_HISTORY);
      await secureStorage.setItem(key, JSON.stringify(arr));
      setHistory(arr);
    } catch (e) {
      console.warn("save history error", e);
    }
  };

  const handleSelect = (itemOrTitle) => {
    const titleText = typeof itemOrTitle === "string" ? itemOrTitle : itemOrTitle.title || itemOrTitle.name || "";
    if (!titleText) return;

    switch (source) {
      case "market": {
        const product = typeof itemOrTitle === "object" ? itemOrTitle : sourceData.find((s) => s.title === titleText);
        if (product) {
          navigation.navigate("ProductDetailScreen", { product });
        } else {
          navigation.navigate("Market", { query: titleText });
        }
        break;
      }
      case "reels":
        navigation.navigate("Reels", { query: titleText });
        break;
      case "profile":
        navigation.navigate("Profile", { query: titleText });
        break;
      case "home":
      default:
        navigation.navigate("Home", { query: titleText });
    }

    saveToHistory(titleText);
  };

  const removeHistoryItem = async (term) => {
    try {
      const key = STORAGE_KEY(source);
      const raw = await secureStorage.getItem(key);
      let arr = raw ? JSON.parse(raw) : [];
      arr = arr.filter((t) => t.toLowerCase() !== term.toLowerCase());
      await secureStorage.setItem(key, JSON.stringify(arr));
      setHistory(arr);
    } catch (e) {
      console.warn("remove history item", e);
    }
  };

  const clearHistory = async () => {
    try {
      const key = STORAGE_KEY(source);
      await secureStorage.removeItem(key);
      setHistory([]);
    } catch (e) {
      console.warn("clear history", e);
    }
  };

  // --- Select dataset based on source (memoized)
  const sourceData = useMemo(() => {
    if (source === "market") {
      return (products || []).map((p) => ({
        id: String(p.id),
        title: p.name,
        description: p.description,
        price: p.price,
        ...p,
      }));
    }
    if (source === "reels") {
      return [
        { id: "1", title: "Dance Challenge #AfroWave" },
        { id: "2", title: "Behind the Scenes - Studio Jam" },
        { id: "3", title: "Fashion Reels Compilation" },
      ];
    }
    if (source === "profile") {
      return [
        { id: "1", title: "My first post" },
        { id: "2", title: "Streetwear vibes" },
        { id: "3", title: "Afrobeats concert highlights" },
        { id: "4", title: "Design sketches" },
      ];
    }
    // default: home
    return [
      { id: "1", title: "New Streetwear Drop" },
      { id: "2", title: "Afrobeats Concert Highlights" },
      { id: "3", title: "Trending Designer Looks" },
    ];
  }, [source, products]);

  // --- Filter results
  const results = useMemo(() => {
    if (!query.trim()) return sourceData;
    return sourceData.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, sourceData]);

  // labels can be derived from `source` if needed

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
      <Text style={styles.resultText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search header handled by AppHeader; inline titles removed */}

      {/* Search Input */}
      <TextInput
        style={styles.input}
        placeholder="Type to search..."
        placeholderTextColor="#aaa"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={({ nativeEvent }) => {
          const val = (nativeEvent && nativeEvent.text) || query;
          if (val && val.trim()) saveToHistory(val.trim());
        }}
      />

      {/* Loading indicator for market search */}
      {source === "market" && loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      )}

      {/* When empty query: show recent searches and suggestions */}
      {query.trim() === "" ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent searches</Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={clearHistory}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {history.length === 0 ? (
            <Text style={styles.empty}>No recent searches.</Text>
          ) : (
            <View style={styles.historyList}>
              {history.map((h) => (
                <View key={h} style={styles.historyRow}>
                  <TouchableOpacity
                    onPress={() => handleSelect(h)}
                    style={styles.historyItem}
                  >
                    <Text style={styles.historyText}>{h}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeHistoryItem(h)} style={styles.removeBtn}>
                    <Text style={styles.removeText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Suggestions</Text>
          <View style={styles.suggestionsRow}>
            {(sourceData || []).slice(0, 6).map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.suggestionItem}
                onPress={() => handleSelect(s)}
              >
                <Text style={styles.suggestionText}>{s.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {source === "profile" && savedItems && savedItems.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Saved</Text>
              <View style={styles.suggestionsRow}>
                {savedItems.map((s, i) => (
                  <TouchableOpacity
                    key={s.id || `${s}-${i}`}
                    style={styles.suggestionItem}
                    onPress={() => handleSelect(s)}
                  >
                    <Text style={styles.suggestionText}>{s.title || s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </>
      ) : (
        /* Results */
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No results found.</Text>}
          contentContainerStyle={styles.resultsContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#000",
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  clearText: {
    fontSize: 13,
    color: "#1DA1F2",
  },
  historyList: {
    marginTop: 6,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  historyItem: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  historyText: {
    color: "#333",
  },
  removeBtn: {
    marginLeft: 8,
    padding: 6,
  },
  removeText: {
    fontSize: 18,
    color: "#999",
  },
  suggestionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  headerBack: {
    padding: 8,
    marginRight: 8,
  },
  inlineInput: {
    flex: 1,
    marginRight: 8,
  },
  clearBtn: {
    padding: 6,
  },
  suggestionItem: {
    backgroundColor: "#f3f3f3",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 13,
    color: "#333",
  },
  resultsContainer: {
    paddingBottom: 40,
  },
  resultItem: {
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  resultText: {
    fontSize: 16,
    color: "#222",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    fontSize: 15,
    marginTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
});
