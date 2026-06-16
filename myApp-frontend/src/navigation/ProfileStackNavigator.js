// src/navigation/ProfileStackNavigator.js
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen";
import MenuStackNavigator from "./MenuStackNavigator"; // the menu + its stack

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="MenuMain" component={MenuStackNavigator} />
    </Stack.Navigator>
  );
}