import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const RecommendedCard = ({ title, subtitle, tag, color, onPress }: { title: string, subtitle: string, tag: string, color: string, onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    className={`${color} w-64 h-80 rounded-[48px] p-8 mr-4 shadow-soft relative overflow-hidden`}
  >
    {/* Decorative Dashed Circle in Center */}
    <View className="absolute inset-0 items-center justify-center opacity-20">
      <View
        className="w-32 h-32 rounded-full border-2 border-white border-dashed"
      />
      <View
        className="w-16 h-16 rounded-full bg-white opacity-40 absolute"
      />
    </View>

    <View className="flex-row justify-between items-start z-10">
      <View className="bg-white/30 px-4 py-1.5 rounded-full">
        <Text className="text-textPrimary font-bold text-[10px] uppercase tracking-wider">{tag}</Text>
      </View>
      <View className="w-10 h-10 rounded-full bg-white/30 items-center justify-center">
        <Ionicons name="play" size={18} color="#2D1E17" />
      </View>
    </View>

    <View className="flex-1" />

    <View className="z-10">
      <Text className="text-textPrimary font-bold text-2xl leading-tight mb-1">{title}</Text>
      <Text className="text-textPrimary/60 font-medium text-sm">{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

const CategoryCard = ({ title, icon, color, onPress, count }: { title: string, icon: any, color: string, onPress: () => void, count: string }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white p-5 rounded-[32px] mb-4 flex-row items-center justify-between shadow-card border border-secondary/10"
  >
    <View className="flex-row items-center">
      <View className={`${color} w-14 h-14 rounded-2xl items-center justify-center mr-4 shadow-soft`}>
        <Ionicons name={icon} size={28} color="white" />
      </View>
      <View>
        <Text className="text-textPrimary font-bold text-lg">{title}</Text>
        <Text className="text-textSecondary text-xs font-medium">{count} activities</Text>
      </View>
    </View>
    <View className="w-8 h-8 rounded-full bg-background items-center justify-center">
      <Ionicons name="chevron-forward" size={18} color="#FF7B1B" />
    </View>
  </TouchableOpacity>
);

export default function WellnessHubScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 py-6 flex-row justify-between items-center">
        <View className="w-10 h-10 rounded-full bg-textPrimary items-center justify-center">
          <Ionicons name="leaf" size={20} color="white" />
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
          <Ionicons name="search" size={20} color="#2D1E17" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 mb-8">
          <Text className="text-textSecondary font-bold text-sm uppercase tracking-widest mb-1">Daily Practices</Text>
          <Text className="text-4xl font-bold text-textPrimary leading-tight">
            Exercises based on your <Text className="text-primary italic">needs</Text>
          </Text>
        </View>

        {/* Recommended Section */}
        <View className="mb-10">
          <View className="flex-row justify-between items-center px-6 mb-6">
            <Text className="text-textPrimary text-xl font-bold">Recommended for You</Text>
            <TouchableOpacity>
              <Text className="text-textSecondary font-bold text-sm">See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            <RecommendedCard
              tag="Focus"
              title={"3-Min\nBreathing"}
              subtitle="Quick reset for anxiety"
              color="bg-[#CEDDFB]"
              onPress={() => router.push("/wellness/breathing")}
            />
            <RecommendedCard
              tag="Journal"
              title={"Gratitude\nShift"}
              subtitle="Shift your perspective"
              color="bg-[#F9E7B3]"
              onPress={() => router.push("/(tabs)/journal")}
            />
            <RecommendedCard
              tag="Relax"
              title={"Night\nSounds"}
              subtitle="Drift into deep sleep"
              color="bg-[#FFD1B0]"
              onPress={() => router.push("/wellness/sounds")}
            />
          </ScrollView>
        </View>

        <View className="px-6 mb-20">
          <Text className="text-textPrimary text-xl font-bold mb-6">Explore Tools</Text>
          <CategoryCard
            title="Breathing"
            icon="water"
            color="bg-primary"
            onPress={() => router.push("/wellness/breathing")}
            count="12"
          />
          <CategoryCard
            title="Exercises"
            icon="fitness"
            color="bg-mood-calm"
            onPress={() => router.push("/wellness/exercises")}
            count="8"
          />
          <CategoryCard
            title="Relaxation Sounds"
            icon="musical-notes"
            color="bg-accent"
            onPress={() => router.push("/wellness/sounds")}
            count="15"
          />
        </View>
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}