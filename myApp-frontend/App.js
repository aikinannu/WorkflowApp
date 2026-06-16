// App.js
import { NavigationContainer } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { registerRootComponent } from "expo";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { MarketProvider } from "./src/context/MarketContext";
import RootNavigator from "./src/navigation/RootNavigator";

WebBrowser.maybeCompleteAuthSession();
SplashScreen.preventAutoHideAsync();

console.log('APP_DEBUG: React version (App.js):', React && React.version);
if (typeof window !== 'undefined') {
  try {
    window.__APP_REACT_VERSION = React && React.version;
  } catch (e) {}
}

if (typeof document !== 'undefined') {
  document.title = "Godemar's Empire";
}

if (typeof globalThis !== 'undefined') {
  globalThis.__APP_TITLE_SET = true;
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const setTitle = () => {
      if (typeof document !== 'undefined') {
        document.title = "Godemar's Empire";
        const titleEl = document.querySelector('title');
        if (titleEl) {
          titleEl.textContent = "Godemar's Empire";
        }
      }
    };

    setTitle();
    const titleInterval = setInterval(setTitle, 300);

    async function prepare() {
      try {
        // Load fonts here if needed
        await Font.loadAsync({});
        await new Promise((resolve) => setTimeout(resolve, 350));
      } catch (e) {
        console.warn('APP_EFFECT_ERROR', e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();

    return () => clearInterval(titleInterval);
  }, []);

  if (!appIsReady) return null;

  const linking = {
    prefixes: [Linking.createURL("/")],
    config: {
      screens: {
        Welcome: "welcome",
        Login: "login",
        Signup: "signup",
        ForgotPassword: "forgot-password",
        MainTabs: {
          screens: {
            Home: "home",
            Reels: "reels",
            Add: "add",
            Market: "market",
            Profile: "profile",
          },
        },
        Details: "details",
        Menu: "menu",
        Chat: "chat",
        CreateGroup: "create-group",
        Search: "search",
        Notifications: "notifications",
        Messages: "messages",
        Cart: "cart",
        Filters: "filters",
      },
    },
  };

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MarketProvider>
          <CartProvider>
            <NavigationContainer linking={linking}>
              <AuthConsumer />
            </NavigationContainer>
          </CartProvider>
        </MarketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

if (typeof globalThis !== "undefined" && !globalThis.__expoRegisteredRootComponent) {
  registerRootComponent(App);
  globalThis.__expoRegisteredRootComponent = true;
}

function AuthConsumer() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return <RootNavigator />;
}