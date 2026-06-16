// src/screens/WelcomeScreen.js
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

export default function WelcomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width * 0.92, 520);
  const emblemSize = Math.min(width * 0.55, 260);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.card, { width: cardWidth }]}>          
          <View style={[styles.emblemWrapper, { width: emblemSize, height: emblemSize, borderRadius: emblemSize / 2 }]}>            
            <View style={[styles.emblemCircle, { width: emblemSize * 0.72, height: emblemSize * 0.72, borderRadius: (emblemSize * 0.72) / 2 }]}>              
              <Text style={styles.emblemText}>GE</Text>
            </View>
            <View style={styles.crownTop} />
          </View>

          <Text style={styles.title}>Godemar's Empire</Text>
          <Text style={styles.subtitle}>Welcome to the realm of royal strategy, cinematic style, and elite mastery.</Text>
          <Text style={styles.tagline}>Crafting a regal experience</Text>

          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#07060c",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#09090f",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  emblemWrapper: {
    borderWidth: 3,
    borderColor: "#f3d560",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    backgroundColor: "rgba(243, 213, 96, 0.08)",
  },
  emblemCircle: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(243, 213, 96, 0.8)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  emblemText: {
    color: "#f3d560",
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: 2,
  },
  crownTop: {
    position: "absolute",
    top: 8,
    width: "60%",
    height: 26,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: "#f3d560",
    opacity: 0.95,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
  },
  subtitle: {
    color: "#d0c4a3",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 14,
  },
  tagline: {
    color: "#f3d560",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 28,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: "#f3d560",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 14,
  },
  primaryButtonText: {
    color: "#07060c",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#f3d560",
    paddingVertical: 16,
    borderRadius: 16,
  },
  secondaryButtonText: {
    color: "#f3d560",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
