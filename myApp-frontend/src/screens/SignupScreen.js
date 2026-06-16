// src/screens/SignupScreen.js
import { useEffect, useState } from "react";
import { Alert, Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function SignupScreen({ navigation }) {
  const { user, signup, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width * 0.9, 420);

  useEffect(() => {
    if (user) navigation.replace("MainTabs");
  }, [user, navigation]);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    await signup(fullName, email, password);
  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { width: cardWidth }]}>          
          <Text style={styles.heading}>Create Your Account</Text>

          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#aaa"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />

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

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#aaa"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.toggleButton}>
              <Text style={styles.toggleText}>{showConfirmPassword ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonWrapper}>
            <Button title={loading ? "Creating..." : "Sign Up"} onPress={handleSignup} disabled={loading} />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.bottomAction}>
            <Text style={styles.bottomText}>Already have an account? <Text style={styles.actionText}>Log in</Text></Text>
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
