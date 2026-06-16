// src/screens/FilterScreen.js
import Slider from "@react-native-community/slider";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppHeader from "../components/AppHeader";
import { useMarket } from "../context/MarketContext";

export default function FilterScreen() {
  const { filters, setFilters } = useMarket();

  return (
    <View style={styles.container}>
      <AppHeader title="Filters" />
      <Text style={styles.label}>Max Price: ${filters.maxPrice}</Text>
      <Slider
        minimumValue={10}
        maximumValue={200}
        value={filters.maxPrice}
        onValueChange={(value) => setFilters({ ...filters, maxPrice: Math.floor(value) })}
        style={styles.slider}
      />
      <TouchableOpacity
        style={styles.clear}
        onPress={() => setFilters({ category: "", maxPrice: 100 })}
      >
        <Text style={styles.clearText}>Reset Filters</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  label: { fontSize: 16, marginBottom: 10 },
  slider: { width: "100%", height: 40 },
  clear: {
    marginTop: 30,
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  clearText: { color: "#fff", fontWeight: "600" },
});