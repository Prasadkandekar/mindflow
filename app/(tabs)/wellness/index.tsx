import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function WellnessHubScreen() {
  const router = useRouter();

  const CategoryCard = ({ title, icon, color, route, count }: { title: string, icon: any, color: string, route: any, count: string }) => (
    <TouchableOpacity
      onPress={() => router.push(route)}
      className="bg-white p-6 rounded-[32px] mb-4 flex-row items-center justify-between border border-gray-100 shadow-sm"
    >
      <View className="flex-row items-center">
        <View className={`${color} w-14 h-14 rounded-2xl items-center justify-center mr-4 shadow-sm`}>
          <Ionicons name={icon} size={28} color="white" />
        </View>
        <View>
          <Text className="text-gray-900 font-bold text-lg">{title}</Text>
          <Text className="text-gray-400 text-xs">{count} activities</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#e2e8f0" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-6 border-b border-gray-100 bg-white">
        <Text className="text-3xl font-bold">Wellness Hub 🌿</Text>
      </View>

      <ScrollView className="p-6">
        <View className="mb-6">
          <Text className="text-gray-500 font-medium leading-relaxed">
            Take a moment for yourself. Choose a category below to explore curated wellness activities.
          </Text>
        </View>

        <CategoryCard
          title="Breathing"
          icon="air"
          color="bg-blue-400"
          route="/wellness/breathing"
          count="12"
        />
        <CategoryCard
          title="Exercises"
          icon="body"
          color="bg-emerald-400"
          route="/wellness/exercises"
          count="8"
        />
        <CategoryCard
          title="Relaxation Sounds"
          icon="musical-notes"
          color="bg-purple-400"
          route="/wellness/sounds"
          count="15"
        />
        <CategoryCard
          title="Mindfulness"
          icon="sunny"
          color="bg-rose-400"
          route="/wellness/index"
          count="10"
        />

        <View className="mt-8 bg-indigo-50 p-8 rounded-[40px] items-center border border-indigo-100">
          <Ionicons name="sparkles" size={32} color="#6366f1" />
          <Text className="text-indigo-900 font-bold text-xl mt-4 text-center">Daily Recommendation</Text>
          <Text className="text-indigo-600 text-center mt-2 mb-6">"5-min Afternoon Focus Reset"</Text>
          <TouchableOpacity className="bg-indigo-600 px-8 py-3 rounded-2xl">
            <Text className="text-white font-bold">Start Now</Text>
          </TouchableOpacity>
        </View>
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}