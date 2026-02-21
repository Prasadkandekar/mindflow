import { Buffer } from 'buffer';
import { Stack } from "expo-router";
import { Platform } from "react-native";
import 'react-native-get-random-values';
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

// Polyfill Buffer globally for libraries that depend on it (like jigsawstack)
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// ─── LiveKit Global Setup ─────────────────────────────────────────────────────
// registerGlobals() sets up the native WebRTC bindings required by LiveKit.
// MUST be called once at app startup before any LiveKit features are used.
// Guarded to native-only since LiveKit is stubbed on web via metro.config.js.
if (Platform.OS !== 'web') {
  try {
    const livekit = require('@livekit/react-native');
    if (livekit && livekit.registerGlobals) {
      livekit.registerGlobals();
    } else {
      console.warn('LiveKit registerGlobals not found. This is expected in Expo Go.');
    }
  } catch (e) {
    console.warn('LiveKit globals failed to register. This is expected in Expo Go if not using a development build.', e);
  }
}

export default function RootLayout() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
