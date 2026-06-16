// src/config/firebase.js
import secureStorage from "../utils/secureStorage";
import { initializeApp } from "firebase/app";
import {
  getReactNativePersistence,
  initializeAuth,
  getAuth,
} from "firebase/auth";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBDaICTsfPNBNhRFvqSFkg0WwtgKSKjD3k",
  authDomain: "godemar-s-empire-100.firebaseapp.com",
  projectId: "godemar-s-empire-100",
  storageBucket: "godemar-s-empire-100.appspot.com",
  messagingSenderId: "592757859533",
  appId: "1:592757859533:web:28c28f9d9462444899f584",
  measurementId: "G-M5XVR9CV6G",
};

const app = initializeApp(firebaseConfig);

// Initialize Auth differently for web vs native.
// On web use the standard getAuth (browser persistence). On native use
// initializeAuth with react-native AsyncStorage persistence.
export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
          persistence: getReactNativePersistence({
            getItem: secureStorage.getItem,
            setItem: secureStorage.setItem,
            removeItem: secureStorage.removeItem,
          }),
        });

export default app;
