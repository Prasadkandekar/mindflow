import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchToken } from '@/hooks/useConnectionDetails';

// Check if LiveKit is available (development build vs Expo Go)
const isLiveKitAvailable = () => {
  if (Platform.OS === 'web') return true; // Web uses livekit-client
  try {
    const livekit = require('@livekit/react-native');
    return !!(livekit && livekit.registerGlobals);
  } catch {
    return false;
  }
};

export default function VoiceCompanionScreen() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const startSession = async () => {
    // Check if LiveKit is available before attempting connection
    if (!isLiveKitAvailable()) {
      Alert.alert(
        'Development Build Required',
        'Voice companion requires a development build to work.\n\n' +
        'To use this feature:\n' +
        '1. Run: npx expo run:android (or ios)\n' +
        '2. Or build with: npx eas build --profile development\n\n' +
        'This feature does not work in Expo Go.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsConnecting(true);
      console.log('[Companion] Fetching token...');
      const details = await fetchToken();
      console.log('[Companion] Token fetched:', !!details?.token);
      setIsConnecting(false);

      if (details?.token && details?.url) {
        console.log('[Companion] Navigating to active-session with token');
        // Use replace instead of push to avoid back navigation issues
        router.push({
          pathname: '/(tabs)/companion/active-session',
          params: { 
            token: details.token, 
            url: details.url 
          },
        });
      } else {
        console.error('[Companion] Could not fetch LiveKit token or URL');
        Alert.alert('Connection Failed', 'Failed to connect. Please check your internet connection and try again.');
      }
    } catch (error) {
      setIsConnecting(false);
      console.error('[Companion] Connection error:', error);
      Alert.alert('Connection Error', error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-6 pb-2 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
          <Ionicons name="chevron-back" size={20} color="#2D1E17" />
        </TouchableOpacity>
        <Text className="text-textPrimary font-bold text-lg">Speaking to AI Bot</Text>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
          <Ionicons name="ellipsis-vertical" size={20} color="#2D1E17" />
        </TouchableOpacity>
      </View>

      {/* Development Build Warning */}
      {!isLiveKitAvailable() && (
        <View className="mx-6 mt-4 bg-secondary/20 p-4 rounded-2xl border border-secondary/30">
          <View className="flex-row items-center mb-2">
            <Ionicons name="warning" size={20} color="#FF7B1B" />
            <Text className="text-textPrimary font-bold ml-2">Development Build Required</Text>
          </View>
          <Text className="text-textSecondary text-xs">
            Voice features require a development build. Run: npx expo run:android
          </Text>
        </View>
      )}

      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-textSecondary text-center font-medium mb-8">
          I'm here to help, just say it
        </Text>

        {/* Central Orb/Visualizer - Now Clickable */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={startSession}
          disabled={isConnecting}
          className="relative items-center justify-center mb-12"
        >
          <View className="w-64 h-64 rounded-full bg-primary opacity-10 absolute" />
          <LinearGradient
            colors={['#FFD1B0', '#FFAB73', '#FF7B1B']}
            className="w-56 h-56 rounded-full shadow-soft items-center justify-center"
          >
            <View className="w-48 h-48 rounded-full bg-white/20 border border-white/40 items-center justify-center">
              {isConnecting ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <Ionicons name="mic" size={64} color="white" />
              )}
            </View>
          </LinearGradient>

          {/* Wave Pattern */}
          <View className="absolute bottom-[-10] flex-row items-center gap-1.5">
            {[12, 24, 32, 24, 16, 28, 36, 18, 12, 22].map((h, i) => (
              <View
                key={i}
                className="w-1.5 bg-primary/60 rounded-full"
                style={{ height: h }}
              />
            ))}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={startSession}
          disabled={isConnecting}
          className="bg-primary/10 px-6 py-3 rounded-2xl mb-8"
        >
          <Text className="text-primary font-bold text-lg">
            {isConnecting ? 'Connecting...' : 'Tap to Start Talking'}
          </Text>
        </TouchableOpacity>

        <Text className="text-textPrimary text-2xl font-bold text-center px-4 leading-tight">
          "Which films are currently showing nearby and trending this week?"
        </Text>
      </View>

      {/* Bottom Interaction Bar */}
      <View className="px-6 pb-32">

        {/* Floating Input Bar */}
        <View className="flex-row items-center bg-[#2D1E17] p-2 rounded-full shadow-soft">
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
          <TextInput
            placeholder="Ask me anything"
            placeholderTextColor="rgba(255,255,255,0.4)"
            className="flex-1 text-white px-2 font-medium"
          />
          <TouchableOpacity className="w-10 h-10 items-center justify-center bg-white/10 rounded-full">
            <Ionicons name="mic" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={startSession}
            disabled={isConnecting}
            className="w-12 h-12 bg-white rounded-full items-center justify-center ml-2"
          >
            {isConnecting ? (
              <ActivityIndicator size="small" color="#2D1E17" />
            ) : (
              <Ionicons name="arrow-up" size={20} color="#2D1E17" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}