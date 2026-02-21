import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={["#FFD1B0", "#FFF9F5"]}
      className="flex-1 justify-center items-center"
    >
      <View className="items-center">
        {/* App Logo/Icon Container */}
        <View className="w-40 h-40 bg-white rounded-[50px] shadow-soft justify-center items-center mb-8">
          <Text className="text-[70px]">🌙</Text>
        </View>

        {/* App Name */}
        <Text className="text-[36px] text-textPrimary font-bold tracking-tight">MindFlow</Text>
        <Text className="text-[18px] text-textSecondary mt-2 font-medium">Your Mindful Space</Text>

        {/* Loading Animation */}
        <ActivityIndicator size="small" color="#FF7B1B" className="mt-12" />
      </View>

      {/* Encryption Badge */}
      <View className="absolute bottom-12 flex-row items-center bg-white/50 px-4 py-2 rounded-full">
        <Text className="text-[12px] text-textSecondary font-semibold">
          🔒 End-to-End Encrypted
        </Text>
      </View>
    </LinearGradient>
  );
}
