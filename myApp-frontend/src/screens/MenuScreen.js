// src/screens/MenuScreen.js
import Ionicons from "@expo/vector-icons/Ionicons"; // ✅ Import icons
import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

export default function MenuScreen() {
  const navigation = useNavigation();

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const menuItems = [
    { label: "Profile", screen: "Profile" },
    { label: "Dashboard", screen: "Dashboard" },
    { label: "Community", screen: "Community" },
    { label: "Plans & Licensing", screen: "License" },
    { label: "Settings", screen: "Settings" },
    { label: "Vision", screen: "Vision" },
    { label: "Team", screen: "Team" },
    { label: "Careers & Job Offers", screen: "Careers" },
    { label: "Contact", screen: "Contact" },
    { label: "About", screen: "About" },
  ];

  return (
    <View style={[styles.container, isDesktop ? styles.containerDesktop : null]}>
      {/* Side drawer for desktop, full-screen menu for mobile */}
      <View style={[styles.drawer, isDesktop ? styles.drawerDesktop : null]}>
        <View style={[styles.header, isDesktop ? styles.headerDesktop : null]}>
          {!isDesktop && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color="#000" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Menu</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => navigation.replace("Login")}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isDesktop && (
        <View style={styles.mainArea}>
          <Text style={styles.mainPlaceholder}>Select a section from the menu</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 60,
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    color: "#222",
    fontSize: 16,
    fontWeight: "500",
  },
  logoutContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  logoutButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row", // ✅ for icon + text alignment
    shadowColor: "#007AFF",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  /* Desktop / drawer styles */
  containerDesktop: { flexDirection: "row" },
  drawer: { width: "100%", backgroundColor: '#fff' },
  drawerDesktop: { width: 280, borderRightWidth: 1, borderRightColor: '#eee', height: '100%' },
  headerDesktop: { paddingTop: 20, paddingBottom: 16, justifyContent: 'flex-start' },
  mainArea: { flex: 1, padding: 20, backgroundColor: '#fbfbfb' },
  mainPlaceholder: { color: '#666', fontSize: 16 },
});