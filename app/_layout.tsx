import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../context/AuthContext";
import "../global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#0f172a" },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="dashboard" options={{ headerShown: true, title: 'Analytics', headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f8fafc' }} />
          </Stack>
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
