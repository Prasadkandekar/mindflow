import { Stack } from "expo-router";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

// ─── LiveKit Global Setup ─────────────────────────────────────────────────────
// registerGlobals() sets up the native WebRTC bindings required by LiveKit.
// MUST be called once at app startup before any LiveKit features are used.
// Guarded to native-only since LiveKit is stubbed on web via metro.config.js.
if (Platform.OS !== 'web') {
  const { registerGlobals } = require('@livekit/react-native');
  registerGlobals();
}

export default function RootLayout() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
