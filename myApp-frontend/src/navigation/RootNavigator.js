// src/navigation/RootNavigator.js
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

// App main tabs
import MainTabNavigator from "../navigation/MainTabNavigator";

// Other app screens
import CreateGroupScreen from "../screens/CreateGroupScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";

// Header-linked screens
import CartScreen from "../screens/CartScreen";
import ChatScreen from "../screens/ChatScreen";
import FiltersScreen from "../screens/FiltersScreen";
import HomeScreen from "../screens/HomeScreen";
import MarketScreen from "../screens/MarketScreen";
import MessagesScreen from "../screens/MessagesScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ReelsScreen from "../screens/ReelsScreen";
import SearchScreen from "../screens/SearchScreen";
import SellProductScreen from "../screens/SellProductScreen";
import PostJobScreen from "../screens/PostJobScreen";
import StoryViewerScreen from "../screens/StoryViewerScreen";

// Auth screens
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import MenuScreen from "./../screens/MenuScreen";
import LicenseScreen from "../screens/LicenseScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user } = useAuth(); // user = null (logged out) or object (logged in)

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* ✅ If no user, show Auth flow */}
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="License" component={LicenseScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        <>
          {/* ✅ Main app (protected) */}
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="Details" component={ProductDetailScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ headerShown: false }} />


          {/* 🧭 Screens linked from AppHeader */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Reels" component={ReelsScreen} />
          <Stack.Screen name="Market" component={MarketScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="License" component={LicenseScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Messages" component={MessagesScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Filters" component={FiltersScreen} />
          <Stack.Screen name="SellProduct" component={SellProductScreen} />
          <Stack.Screen name="PostJob" component={PostJobScreen} />
          <Stack.Screen name="StoryViewer" component={StoryViewerScreen} options={{ presentation: 'modal' }} />
        </>
      )}
    </Stack.Navigator>
  );
}