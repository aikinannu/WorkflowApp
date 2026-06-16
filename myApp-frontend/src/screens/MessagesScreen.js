// src/screens/MessagesScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function MessagesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([
    { id: "101", name: "Tina Mensah", message: "Let's meet at the studio later!", time: "2:45 PM" },
    { id: "102", name: "Ayo Beats", message: "Track mix sounds 🔥", time: "1:10 PM" },
  ]);

  const activeUsers = [
    { id: "1", name: "Ayo", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
    { id: "2", name: "Tina", avatar: "https://randomuser.me/api/portraits/women/47.jpg" },
    { id: "3", name: "Kojo", avatar: "https://randomuser.me/api/portraits/men/10.jpg" },
  ];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // If coming back from CreateGroupScreen
  useEffect(() => {
    if (route.params?.newGroup) {
      setChats((prev) => [route.params.newGroup, ...prev]);
    }
  }, [route.params?.newGroup]);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderActiveUser = ({ item }) => (
    <View style={styles.activeUser}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <Text style={styles.activeName}>{item.name}</Text>
    </View>
  );

  const renderChat = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate("Chat", {
          chatId: item.id,
          chatName: item.name,
          isGroup: item.isGroup || false,
        })
      }
    >
      <Image
        source={{
          uri:
            item.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`,
        }}
        style={styles.chatAvatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatMessage}>{item.message}</Text>
      </View>
      <Text style={styles.chatTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={() => navigation.navigate("CreateGroup")}>
          <Ionicons name="add-circle-outline" size={26} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#666" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search chats..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Active Users */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Now</Text>
        <FlatList
          data={activeUsers}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderActiveUser}
          style={styles.activeList}
        />
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={renderChat}
        contentContainerStyle={styles.chatList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#000" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 8, color: "#000" },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 6 },
  activeUser: { alignItems: "center", marginRight: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  activeName: { fontSize: 13, color: "#333", marginTop: 4 },
  chatList: { paddingHorizontal: 10, paddingBottom: 20 },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  chatAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  chatName: { fontSize: 16, fontWeight: "600", color: "#000" },
  chatMessage: { fontSize: 14, color: "#555", marginTop: 2 },
  chatTime: { fontSize: 12, color: "#777", marginLeft: 6 },
});