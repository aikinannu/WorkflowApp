// src/screens/VisionScreen.js
import { ScrollView, StyleSheet, Text, View } from "react-native";
import TopBar from "../components/TopBar";

export default function VisionScreen() {
  return (
    <View style={styles.container}>
      <TopBar title="Vision" showSearch showNotifications />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.contentText}>
          Our vision is to connect people through creativity, commerce, and community. This is a placeholder for detailed vision content, describing the platform’s mission and future goals.
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