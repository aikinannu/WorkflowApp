import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TopBar({ title, showSearch, showNotifications }) {
  const navigation = useNavigation();

  const handleSearch = () => navigation.navigate("Search", { source: title.toLowerCase() });
  const handleNotifications = () => navigation.navigate("Notifications");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.iconGroup}>
        {showSearch ? (
          <TouchableOpacity onPress={handleSearch} style={styles.iconButton}>
            <Ionicons name="search-outline" size={22} color="#000" />
          </TouchableOpacity>
        ) : null}
        {showNotifications ? (
          <TouchableOpacity onPress={handleNotifications} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color="#000" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 16,
  },
});
