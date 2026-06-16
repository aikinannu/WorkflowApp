// src/screens/ForgotPasswordScreen.js
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword({ navigation }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    await resetPassword(email);
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput placeholder="Enter your email" style={styles.input} value={email} onChangeText={setEmail} />
      <TouchableOpacity style={styles.button} onPress={handleReset}><Text style={styles.buttonText}>Send Reset Link</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}><Text style={styles.link}>Back to Login</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "700", textAlign: "center", marginBottom: 24 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginBottom: 12 },
  button: { backgroundColor: "#000", padding: 14, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  link: { marginTop: 20, textAlign: "center", color: "#0066cc" },
});