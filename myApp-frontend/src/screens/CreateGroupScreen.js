// src/screens/CreateGroupScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function CreateGroupScreen() {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Dummy user data for demonstration
  const users = [
    { id: "1", name: "Aisha", image: "https://i.pravatar.cc/100?img=1" },
    { id: "2", name: "Kofi", image: "https://i.pravatar.cc/100?img=2" },
    { id: "3", name: "Zara", image: "https://i.pravatar.cc/100?img=3" },
    { id: "4", name: "David", image: "https://i.pravatar.cc/100?img=4" },
    { id: "5", name: "Mariam", image: "https://i.pravatar.cc/100?img=5" },
    { id: "6", name: "Kwame", image: "https://i.pravatar.cc/100?img=6" },
  ];

  const toggleUserSelection = (user) => {
    if (selectedUsers.includes(user.id)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user.id]);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert("Group Name Required", "Please enter a name for your group.");
      return;
    }
    if (selectedUsers.length === 0) {
      Alert.alert("No Members Selected", "Please select at least one member.");
      return;
    }
    Alert.alert(
      "Group Created 🎉",
      `Your group "${groupName}" has been created with ${selectedUsers.length} members.`
    );
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Group Image Placeholder */}
        <TouchableOpacity style={styles.groupImageContainer}>
          <Ionicons name="camera-outline" size={40} color="#555" />
          <Text style={styles.addPhotoText}>Add Group Photo</Text>
        </TouchableOpacity>

        {/* Group Name Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter Group Name"
          placeholderTextColor="#888"
          value={groupName}
          onChangeText={setGroupName}
        />

        {/* Members Selection */}
        <Text style={styles.sectionTitle}>Select Members</Text>
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const selected = selectedUsers.includes(item.id);
            return (
              <TouchableOpacity
                style={[
                  styles.userItem,
                  selected && { backgroundColor: "#E6F0FF" },
                ]}
                onPress={() => toggleUserSelection(item)}
              >
                <Image source={{ uri: item.image }} style={styles.avatar} />
                <Text style={styles.userName}>{item.name}</Text>
                {selected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color="#007AFF"
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>
            );
          }}
        />

        {/* Create Group Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create Group</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#000" },
  content: { padding: 16 },
  groupImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 100,
    height: 120,
    width: 120,
    alignSelf: "center",
    marginBottom: 20,
  },
  addPhotoText: {
    fontSize: 13,
    color: "#666",
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#eee",
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  userName: { fontSize: 15, color: "#000" },
  createButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});