import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function VoiceCompanionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        <View className="items-center mb-12">
          <View className="w-24 h-24 bg-emerald-100 rounded-[32px] items-center justify-center mb-6">
            <Ionicons name="mic" size={48} color="#10b981" />
          </View>
          <Text className="text-gray-900 text-3xl font-bold text-center mb-4">Voice Companion 🎧</Text>
          <Text className="text-gray-500 text-center text-lg leading-relaxed">
            "How are you feeling today?"
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/companion/active-session')}
          className="w-full"
        >
          <LinearGradient
            colors={['#10b981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6 rounded-[32px] items-center shadow-lg shadow-emerald-200"
          >
            <View className="flex-row items-center">
              <Ionicons name="play" size={24} color="white" />
              <Text className="text-white font-bold text-xl ml-2">Start Talking</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View className="mt-12 p-6 bg-gray-50 rounded-[32px] w-full">
          <View className="flex-row items-center mb-3">
            <Ionicons name="information-circle" size={20} color="#6b7280" />
            <Text className="text-gray-700 font-bold ml-2">How it works</Text>
          </View>
          <Text className="text-gray-500 text-sm leading-relaxed">
            Speak naturally about your day. I'll listen, analyze your patterns, and provide insights to help you manage stress.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}