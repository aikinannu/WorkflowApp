// src/components/FilterModal.js
import { useEffect, useState } from "react";
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

/**
 * Lightweight FilterModal:
 * - category selection (multi)
 * - preset price ranges (simple approach)
 * - brand selection
 *
 * In production, replace price presets with a slider or numeric inputs.
 */

const CATEGORIES = ["All", "Clothing", "Accessories", "Music", "Footwear"];
const BRANDS = ["All", "Godemar", "VinylCo", "SnapStyle", "StepUp"];
const PRICE_PRESETS = [
  { label: "All", range: [0, 1000] },
  { label: "Under $25", range: [0, 25] },
  { label: "$25 - $50", range: [25, 50] },
  { label: "$50 - $100", range: [50, 100] },
  { label: "Above $100", range: [100, 1000] },
];

export default function FilterModal({ visible, onClose, initialFilters = {}, onApply }) {
  const [category, setCategory] = useState(initialFilters.category || "All");
  const [brand, setBrand] = useState(initialFilters.brand || "All");
  const [pricePreset, setPricePreset] = useState(
    PRICE_PRESETS.find((p) => p.range[0] === (initialFilters.priceRange?.[0] ?? 0))?.label ||
      "All"
  );
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || "relevance");

  useEffect(() => {
    if (visible) {
      setCategory(initialFilters.category || "All");
      setBrand(initialFilters.brand || "All");
      setPricePreset(
        PRICE_PRESETS.find((p) => p.range[0] === (initialFilters.priceRange?.[0] ?? 0))?.label ||
          "All"
      );
      setSortBy(initialFilters.sortBy || "relevance");
    }
  }, [
    visible,
    initialFilters.category,
    initialFilters.brand,
    initialFilters.priceRange,
    initialFilters.sortBy,
  ]);

  const handleApply = () => {
    const selectedPreset = PRICE_PRESETS.find((p) => p.label === pricePreset) || PRICE_PRESETS[0];
    onApply({
      category,
      brand,
      priceRange: selectedPreset.range,
      sortBy,
    });
    onClose();
  };

  const handleReset = () => {
    setCategory("All");
    setBrand("All");
    setPricePreset("All");
    setSortBy("relevance");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.row}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, category === c && styles.chipActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={category === c ? styles.chipTextActive : styles.chipText}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Price</Text>
            <View style={styles.row}>
              {PRICE_PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={[styles.chip, pricePreset === p.label && styles.chipActive]}
                  onPress={() => setPricePreset(p.label)}
                >
                  <Text style={pricePreset === p.label ? styles.chipTextActive : styles.chipText}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Brand</Text>
            <View style={styles.row}>
              {BRANDS.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.chip, brand === b && styles.chipActive]}
                  onPress={() => setBrand(b)}
                >
                  <Text style={brand === b ? styles.chipTextActive : styles.chipText}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Sort</Text>
            <View style={styles.row}>
              {[
                { key: "relevance", label: "Relevance" },
                { key: "price_asc", label: "Price ↑" },
                { key: "price_desc", label: "Price ↓" },
              ].map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.chip, sortBy === s.key && styles.chipActive]}
                  onPress={() => setSortBy(s.key)}
                >
                  <Text style={sortBy === s.key ? styles.chipTextActive : styles.chipText}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleApply} style={styles.applyBtn}>
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  closeText: { color: "#333" },
  content: { paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: { fontSize: 14, marginTop: 12, marginBottom: 8, fontWeight: "700" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: "#000", borderColor: "#000" },
  chipText: { color: "#333" },
  chipTextActive: { color: "#fff" },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    justifyContent: "space-between",
  },
  resetBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  resetText: { color: "#333", fontWeight: "700" },
  applyBtn: { backgroundColor: "#000", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  applyText: { color: "#fff", fontWeight: "700" },
});