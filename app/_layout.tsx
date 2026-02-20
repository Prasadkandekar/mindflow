import { Buffer } from 'buffer';
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

// Polyfill Buffer globally for libraries that depend on it (like jigsawstack)
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

export default function RootLayout() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
