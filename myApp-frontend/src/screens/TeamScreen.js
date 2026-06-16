// src/screens/TeamScreen.js
import { ScrollView, StyleSheet, Text, View } from "react-native";
import TopBar from "../components/TopBar";

export default function TeamScreen() {
  return (
    <View style={styles.container}>
      <TopBar title="Team" showSearch showNotifications />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.contentText}>
          Meet our amazing team! This placeholder represents bios, roles, and photos of the core team members behind Godemar’s Empire.
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