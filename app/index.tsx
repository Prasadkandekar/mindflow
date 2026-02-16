// app/index.tsx
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)/home");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);


  return (
    <View className="flex-1 bg-[#4A90E2] justify-center items-center">
      {/* App Logo */}
      <Text className="text-[50px] mb-5">🔒❤️</Text>

      {/* App Name */}
      <Text className="text-[28px] text-white font-semibold">MoonDiary</Text>
      <Text className="text-[16px] text-white mt-2">Secure Mental Health Journal</Text>

      {/* Loading Animation */}
      <ActivityIndicator size="large" color="#fff" className="mt-5" />

      {/* Encryption Badge */}
      <Text className="absolute bottom-10 text-[14px] text-white">
        🔒 End-to-End Encrypted
      </Text>
    </View>
  );
}
