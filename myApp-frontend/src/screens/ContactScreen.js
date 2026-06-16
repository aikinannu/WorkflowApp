// src/screens/ContactScreen.js
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import TopBar from "../components/TopBar";

export default function ContactScreen() {
  return (
    <View style={styles.container}>
      <TopBar title="Contact" showSearch showNotifications />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput style={styles.input} placeholder="Enter your name" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="Enter your email" keyboardType="email-address" />

        <Text style={styles.label}>Message</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Write your message" multiline numberOfLines={4} />

        <TouchableOpacity style={styles.button} onPress={() => alert("Message sent!")}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { padding: 16 },
  label: { fontSize: 14, color: "#333", marginBottom: 6, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16, fontSize: 16 },
  textArea: { height: 100 },
  button: { backgroundColor: "#1DA1F2", paddingVertical: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});