// src/screens/DashboardScreen.js
import { FlatList, StyleSheet, Text, View } from "react-native";
import TopBar from "../components/TopBar";

const insightsData = [
  { id: "1", title: "Total Posts", value: 24 },
  { id: "2", title: "Total Views", value: 1250 },
  { id: "3", title: "Engagement Rate", value: "18%" },
  { id: "4", title: "Followers Growth", value: "+120" },
  { id: "5", title: "Reach", value: 980 },
];

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <TopBar title="Dashboard" showSearch showNotifications />
      <View style={styles.header}>
        <Text style={styles.headerText}>Creator Insights</Text>
        <Text style={styles.subText}>Monitor your content performance</Text>
      </View>
      <FlatList
        data={insightsData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#ddd", backgroundColor: "#f9f9f9" },
  headerText: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  subText: { fontSize: 14, color: "#666" },
  listContainer: { padding: 16 },
  card: { backgroundColor: "#1DA1F2", padding: 16, borderRadius: 12, marginBottom: 12, elevation: 3 },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cardValue: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 6 },
});