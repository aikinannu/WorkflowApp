// src/screens/LoginScreen.js
import { useEffect, useState } from "react";
import { Alert, Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width * 0.9, 420);

  useEffect(() => {
    if (user) navigation.replace("MainTabs");
  }, [user, navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }
    await login(email, password);
  };

  const handleForgotPassword = () => navigation.navigate("ForgotPassword");

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { width: cardWidth }]}>          
          <Text style={styles.heading}>Welcome Back</Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.toggleButton}>
              <Text style={styles.toggleText}>{showPassword ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleForgotPassword} style={styles.linkContainer}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.buttonWrapper}>
            <Button title={loading ? "Signing in..." : "Login"} onPress={handleLogin} disabled={loading} />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={styles.bottomAction}>
            <Text style={styles.bottomText}>Don&apos;t have an account? <Text style={styles.actionText}>Sign Up</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#020409",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: "#0d1722",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  heading: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#22303f",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    color: "#fff",
    backgroundColor: "#121d28",
  },
  inputWrapper: {
    position: "relative",
    marginBottom: 15,
  },
  toggleButton: {
    position: "absolute",
    right: 14,
    top: 14,
  },
  toggleText: {
    color: "#f3d560",
    fontWeight: "600",
  },
  linkContainer: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    color: "#f3d560",
    fontWeight: "600",
  },
  buttonWrapper: {
    marginVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  bottomAction: {
    marginTop: 20,
  },
  bottomText: {
    color: "#fff",
    textAlign: "center",
    lineHeight: 22,
  },
  actionText: {
    color: "#f3d560",
    fontWeight: "700",
  },
});
