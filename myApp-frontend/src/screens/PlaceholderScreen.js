// src/screens/PlaceholderScreen.js
import { StyleSheet, Text, View } from "react-native";

export default function PlaceholderScreen({ route }) {
  const { title } = route.params || { title: "Placeholder" };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "700" },
});