import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function TrackerDashboard() {
  const router = useRouter();

  const HabitItem = ({ title, icon, value, color }: { title: string, icon: any, value: string, color: string }) => (
    <View className="bg-white p-5 rounded-[28px] mb-4 flex-row items-center justify-between border border-gray-100 shadow-sm">
      <View className="flex-row items-center">
        <View className={`${color} w-12 h-12 rounded-2xl items-center justify-center mr-4`}>
          <Ionicons name={icon} size={24} color="white" />
        </View>
        <Text className="text-gray-900 font-bold text-lg">{title}</Text>
      </View>
      <Text className="text-gray-500 font-bold">{value}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-6 border-b border-gray-100 bg-white">
        <Text className="text-3xl font-bold">Progress Tracker 🔥</Text>
      </View>

      <ScrollView className="p-6">
        <TouchableOpacity
          onPress={() => router.push('/tracker/streak')}
          className="mb-8"
        >
          <LinearGradient
            colors={['#f59e0b', '#d97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-8 rounded-[40px] items-center shadow-lg shadow-amber-200"
          >
            <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-4">
              <Ionicons name="flame" size={40} color="white" />
            </View>
            <Text className="text-white text-3xl font-bold">5 Days</Text>
            <Text className="text-white opacity-80 font-medium">Current Streak</Text>
            <View className="mt-6 bg-white/20 px-6 py-2 rounded-full">
              <Text className="text-white text-xs font-bold">Keep going! 🌿</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-900 text-xl font-bold">Tracked Habits</Text>
          <TouchableOpacity onPress={() => router.push('/tracker/rewards')}>
            <Text className="text-amber-600 font-bold">View Rewards</Text>
          </TouchableOpacity>
        </View>

        <HabitItem title="Mood Logs" icon="happy" value="12/30" color="bg-yellow-400" />
        <HabitItem title="Sleep Logs" icon="bed" value="28/30" color="bg-indigo-500" />
        <HabitItem title="Stress Logs" icon="thunderstorm" value="15/30" color="bg-rose-500" />
        <HabitItem title="Journal Consistency" icon="journal" value="85%" color="bg-emerald-500" />

        <TouchableOpacity
          onPress={() => router.push('/tracker/rewards')}
          className="mt-4 bg-white p-6 rounded-[32px] items-center border border-amber-100 border-dashed"
        >
          <View className="flex-row items-center">
            <Ionicons name="trophy" size={24} color="#f59e0b" />
            <Text className="text-amber-600 font-bold text-lg ml-2">3 Badges Earned Today</Text>
          </View>
        </TouchableOpacity>
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
