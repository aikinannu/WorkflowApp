// src/screens/AboutScreen.js
import { ScrollView, StyleSheet, Text, View } from "react-native";
import TopBar from "../components/TopBar";

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <TopBar title="About" showSearch showNotifications />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.contentText}>
          About Godemar’s Empire: This placeholder contains background information about the platform, its purpose, and the story behind its creation.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { padding: 16 },
  contentText: { fontSize: 16, lineHeight: 24, color: "#333" },
});