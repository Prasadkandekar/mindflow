import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function TrackerDashboard() {
  const router = useRouter();

  const EmotionBubble = ({ label, size, color, moodIcon }: { label: string, size: number, color: string, moodIcon: any }) => (
    <View className="items-center mx-2">
      <View
        className={`${color} rounded-full items-center justify-center shadow-soft`}
        style={{ width: size, height: size }}
      >
        <Ionicons name={moodIcon} size={size * 0.4} color="white" />
      </View>
      <Text className="text-textSecondary text-[10px] mt-2 font-bold uppercase">{label}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-6 pb-2 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
          <Ionicons name="arrow-back" size={20} color="#2D1E17" />
        </TouchableOpacity>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
          <Ionicons name="ellipsis-horizontal" size={20} color="#2D1E17" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-6 pb-24">
        <View className="items-center py-8">
          <Text className="text-primary text-[64px] font-bold">52%</Text>
          <Text className="text-textPrimary text-center text-lg font-semibold px-10 mt-2">
            Your mind needs care, healing, and gentle support.
          </Text>
        </View>

        {/* Emotion Bubbles */}
        <View className="flex-row justify-center items-end mb-12 h-32">
          <EmotionBubble label="Sad" size={56} color="bg-mood-sad" moodIcon="sad" />
          <EmotionBubble label="Happy" size={48} color="bg-mood-happy" moodIcon="happy" />
          <EmotionBubble label="Angry" size={88} color="bg-primary" moodIcon="flame" />
          <EmotionBubble label="Cry" size={40} color="bg-textSecondary" moodIcon="water" />
        </View>

        {/* Statistic Chart */}
        <View className="bg-white p-6 rounded-[40px] shadow-card mb-8">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-textPrimary text-xl font-bold">Your statistic</Text>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={20} color="#8E7E77" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-end justify-between px-2 h-48">
            {[
              { label: 'Happy', value: 30, color: 'bg-mood-happy' },
              { label: 'Sad', value: 60, color: 'bg-mood-sad' },
              { label: 'Angry', value: 90, color: 'bg-primary' },
              { label: 'Cry', value: 45, color: 'bg-textSecondary' },
            ].map((item, idx) => (
              <View key={idx} className="items-center">
                <View className="w-4 bg-background h-36 rounded-full overflow-hidden justify-end">
                  <View className={`${item.color} rounded-full`} style={{ height: `${item.value}%` }} />
                </View>
                <Text className="text-[10px] font-bold text-textSecondary mt-3">{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Today's Note */}
        <LinearGradient
          colors={['#FF7B1B', '#FFAB73']}
          className="p-6 rounded-[32px] flex-row items-center justify-between"
        >
          <View className="flex-1">
            <Text className="text-white/80 text-xs font-semibold uppercase tracking-wider">Today note's</Text>
            <Text className="text-white text-lg font-bold mt-1">Keep It Up and Project Your Mood Now!</Text>
          </View>
          <View className="ml-4 w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
            <Ionicons name="arrow-forward" size={24} color="white" />
          </View>
        </LinearGradient>
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
