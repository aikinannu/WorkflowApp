import { SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput, Image, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMarket } from "../context/MarketContext";
import { marketplace } from "../api/apiClient";
import AppHeader from "../components/AppHeader";

const categories = ["Clothing", "Electronics", "Home", "Beauty", "Sports", "Other"];

function normalizeAsset(asset) {
  const uri = asset.uri || asset.localUri || asset.uri;
  const name = asset.name || asset.fileName || uri?.split("/").pop() || "media";
  let type = asset.type || asset.mediaType || asset.mimeType;
  const width = asset.width || asset.metadata?.width;
  const height = asset.height || asset.metadata?.height;
  if (type === "image" || type === "video") {
    type = `${type}/*`;
  }
  if (!type && uri && uri.includes(".")) {
    const ext = uri.split(".").pop().toLowerCase();
    type = ext === "mp4" || ext === "mov" ? "video/*" : "image/*";
  }
  return { name, uri, type: type || "application/octet-stream", file: asset.file, width, height };
}

export default function SellProductScreen({ navigation }) {
  const { user } = useAuth();
  const { addProduct } = useMarket();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [brand, setBrand] = useState("");
  const [inventory, setInventory] = useState("1");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  

  const handleMediaAssets = (result) => {
    if (!result) return;
    const chosen = Array.isArray(result.assets)
      ? result.assets
      : result.selected || (result.uri ? [result] : []);
    (async () => {
      try {
        const { enrichAssetMetadata } = await import("../api/mediaUtils");
        const enriched = await Promise.all((chosen || []).map(enrichAssetMetadata));
        const mapped = enriched.map(normalizeAsset);
        setFiles((prev) => [...prev, ...mapped]);
      } catch (e) {
        console.warn('asset enrichment failed', e);
        const mapped = (chosen || []).map(normalizeAsset);
        setFiles((prev) => [...prev, ...mapped]);
      }
    })();
  };

  const openFilePickerWeb = (accept, allowsMultiple = false) => {
    if (Platform.OS !== "web") return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = allowsMultiple;
    input.onchange = (event) => {
      const fileList = Array.from(event.target.files || []);
      const assets = fileList.map((file) => ({
        uri: URL.createObjectURL(file),
        name: file.name,
        type: file.type || "image/*",
        file,
      }));
      handleMediaAssets({ assets });
    };
    input.click();
  };

  const chooseImage = async () => {
    if (Platform.OS === "web") {
      openFilePickerWeb("image/*", true);
      return;
    }

    try {
      const ImagePicker = await import("expo-image-picker");
      const status = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!status.granted) {
        alert("Media library permission is required.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      handleMediaAssets(result);
    } catch (error) {
      console.warn(error);
    }
  };

  const handleCreateProduct = async () => {
    if (!user?.tenant_id) {
      alert("Unable to create product: missing tenant context.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a product title.");
      return;
    }

    const priceValue = Number(price);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    const inventoryValue = Number(inventory);
    if (Number.isNaN(inventoryValue) || inventoryValue < 1) {
      alert("Please enter a valid inventory amount.");
      return;
    }

    setSubmitting(true);
    try {
      let uploaded = [];
      if (files.length) {
        const { uploadFiles } = await import("../api/mediaUploader");
        uploaded = await uploadFiles(files, user.tenant_id);
      }

      const image = uploaded[0]?.url || uploaded[0]?.uri || "https://placehold.co/400x400?text=Product";
      const created = await marketplace.createProduct({
        title: title.trim(),
        description: description.trim() || "No description provided.",
        price: priceValue,
        category,
        brand: brand.trim() || "Independent Seller",
        inventory: inventoryValue,
        image,
        tenant_id: user.tenant_id,
      });

      // optimistic update of market state then navigate
      try {
        addProduct(created);
      } catch {
        // ignore
      }

      alert("Product listed successfully.");
      navigation.navigate("Market");
    } catch (error) {
      console.warn(error);
      alert(error.message || "Unable to create product.");
    } finally {
      setSubmitting(false);
    }
  };

  const previewSource = files[0]?.uri;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Sell Product" leftIcon="arrow-back" onLeftPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.label}>Product title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Handcrafted leather bag" />

          <Text style={styles.label}>Price</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="39.99" keyboardType="numeric" />

          <Text style={styles.label}>Inventory</Text>
          <TextInput style={styles.input} value={inventory} onChangeText={setInventory} placeholder="10" keyboardType="numeric" />

          <Text style={styles.label}>Brand</Text>
          <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="Brand name" />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.categoryItem, category === item ? styles.categoryItemActive : null]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.categoryText, category === item ? styles.categoryTextActive : null]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your product..."
            multiline
          />

          <Text style={styles.label}>Product images</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={chooseImage}>
            <Ionicons name="image-outline" size={18} color="#fff" />
            <Text style={styles.uploadButtonText}>Choose images</Text>
          </TouchableOpacity>

          {previewSource ? (
            <Image source={{ uri: previewSource }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderText}>No image selected.</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, submitting ? styles.disabledButton : null]}
            onPress={handleCreateProduct}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>{submitting ? "Listing..." : "List product"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 40 },
  formCard: { backgroundColor: "#f9fbff", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#e8edf5" },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 8, color: "#1f2937" },
  input: { borderWidth: 1, borderColor: "#d1d9e6", backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 16, color: "#111" },
  textArea: { minHeight: 120, textAlignVertical: "top" },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  categoryItem: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "#eef3fb", marginRight: 10, marginBottom: 10 },
  categoryItemActive: { backgroundColor: "#1DA1F2" },
  categoryText: { color: "#334155" },
  categoryTextActive: { color: "#fff" },
  uploadButton: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#1DA1F2", padding: 12, borderRadius: 14, marginBottom: 16 },
  uploadButtonText: { color: "#fff", fontWeight: "700" },
  previewImage: { width: "100%", height: 220, borderRadius: 16, marginBottom: 16 },
  placeholderBox: { height: 220, borderRadius: 16, borderWidth: 1, borderColor: "#d1d9e6", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  placeholderText: { color: "#8291a5" },
  submitButton: { backgroundColor: "#1DA1F2", paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  disabledButton: { opacity: 0.65 },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});