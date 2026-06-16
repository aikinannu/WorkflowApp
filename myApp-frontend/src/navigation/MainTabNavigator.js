// src/navigation/MainTabNavigator.js
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";

// Screens
import AddPostScreen from "../screens/AddPostScreen";
import HomeScreen from "../screens/HomeScreen";
import MarketScreen from "../screens/MarketScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ReelsScreen from "../screens/ReelsScreen";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const addButtonSize = isDesktop ? 52 : 64;
  return (
    <View style={styles.container}>
      <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#1DA1F2",
        tabBarInactiveTintColor: "#555",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#eee",
          paddingBottom: isDesktop ? 4 : 5,
          height: isDesktop ? 52 : 70,
          display: isDesktop ? "none" : "flex",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Reels"
        component={ReelsScreen}
        options={{
          tabBarLabel: "Watch",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="film-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Center Floating Add Button */}
      <Tab.Screen
        name="Add"
        component={AddPostScreen}
        options={{
          tabBarLabel: "",
          tabBarStyle: { display: 'none' },
          tabBarButton: (props) => (
            <TouchableOpacity {...props} style={[styles.addButtonContainer, isDesktop ? { top: -12 } : null]}>
              <View style={[styles.addButton, { width: addButtonSize, height: addButtonSize, borderRadius: addButtonSize / 2 }]}>
                <Ionicons name="add" size={isDesktop ? 24 : 32} color="#fff" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen
        name="Market"
        component={MarketScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="shopping-bag" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
    {isDesktop && (
      <TouchableOpacity
        style={styles.desktopAddButtonWrapper}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("Add")}
      >
        <View
          style={[
            styles.addButton,
            { width: addButtonSize, height: addButtonSize, borderRadius: addButtonSize / 2 },
          ]}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </View>
      </TouchableOpacity>
    )}
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  desktopAddButtonWrapper: {
    position: "absolute",
    bottom: 24,
    right: 24,
    zIndex: 20,
  },
  addButtonContainer: {
    top: -20, // 👈 pushes the button upward
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1DA1F2",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
});