import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchToken } from '@/hooks/useConnectionDetails';

export default function VoiceCompanionScreen() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const startSession = async () => {
    try {
      setIsConnecting(true);
      const details = await fetchToken();
      setIsConnecting(false);

      if (details?.token) {
        router.push({
          pathname: '/companion/active-session',
          params: { token: details.token, url: details.url },
        });
      } else {
        console.error('Could not fetch LiveKit token');
      }
    } catch (error) {
      setIsConnecting(false);
      console.error('Connection error:', error);
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
        {/* Action Chips */}
        <View className="flex-row justify-center gap-2 mb-6">
          <TouchableOpacity className="flex-row items-center bg-white px-4 py-2.5 rounded-full shadow-card border border-secondary/10">
            <Ionicons name="image-outline" size={16} color="#FF7B1B" />
            <Text className="text-textPrimary text-xs font-bold ml-2">Generate Image</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center bg-white px-4 py-2.5 rounded-full shadow-card border border-secondary/10">
            <Ionicons name="videocam-outline" size={16} color="#FF7B1B" />
            <Text className="text-textPrimary text-xs font-bold ml-2">Generate Video</Text>
          </TouchableOpacity>
        </View>

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