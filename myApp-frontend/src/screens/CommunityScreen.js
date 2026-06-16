// src/screens/CommunityScreen.js
import { ScrollView, StyleSheet, Text, View } from "react-native";
import TopBar from "../components/TopBar";

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <TopBar title="Community" showSearch showNotifications />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.contentText}>
          Community placeholder: forums, posts, groups and community interactions will appear here.
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