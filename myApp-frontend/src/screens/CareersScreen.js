// src/screens/CareersScreen.js
import { ScrollView, StyleSheet, Text, View } from "react-native";
import TopBar from "../components/TopBar";

export default function CareersScreen() {
  return (
    <View style={styles.container}>
      <TopBar title="Careers & Jobs" showSearch showNotifications />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.contentText}>
          Explore opportunities to join Godemar’s Empire. This placeholder will eventually list current job openings, internship programs, and recruitment information.
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