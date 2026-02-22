import { Buffer } from 'buffer';
import { Stack } from "expo-router";
import { Platform, View } from "react-native";
import 'react-native-get-random-values';
import "../global.css";

// Polyfill Buffer globally for libraries that depend on it (like jigsawstack)
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// ─── LiveKit Global Setup ─────────────────────────────────────────────────────
let isLiveKitRegistered = false;
if (Platform.OS !== 'web' && !isLiveKitRegistered) {
  try {
    const livekit = require('@livekit/react-native');
    if (livekit && typeof livekit.registerGlobals === 'function') {
      livekit.registerGlobals();
      isLiveKitRegistered = true;
    }
  } catch (e) {
    console.log('LiveKit registration skipped (expected in Expo Go)');
  }
}

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
