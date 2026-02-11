import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const HomeScreen: React.FC = () => {
  const handleMoodSelect = (mood: string) => {
    router.push(`/(tabs)/home/new`)
  };

  const handleSupportPress = () => {
    router.push('/(tabs)/support');
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Top Header Section - Daily Reflection */}
        <View className="bg-[#FEF1E9] px-6 pt-14 pb-12 rounded-b-[40px]">
          <View className="flex-row justify-between items-center mb-8">
            <TouchableOpacity className="bg-black/5 p-2 rounded-xl">
              <MaterialCommunityIcons name="dots-grid" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-black/5 p-2 rounded-xl">
              <Feather name="eye" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-500 font-medium mb-2">Daily reflection</Text>
          <Text className="text-4xl font-bold text-gray-900 leading-tight">
            Hello, Max <Text className="text-3xl">👋</Text>
          </Text>
          <Text className="text-3xl font-bold text-gray-900 leading-tight mb-8">
            How do you feel about your current emotions?
          </Text>

          <View className="bg-white/70 rounded-3xl flex-row items-center px-6 py-5 shadow-sm">
            <TextInput
              placeholder="Your reflection..."
              className="flex-1 text-gray-800 text-lg"
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              className="ml-2 bg-black/5 p-2 rounded-full"
              onPress={() => router.push('/(tabs)/home/new')}
            >
              <Feather name="arrow-up-right" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Mood Log */}
        <View className="px-6 mt-10">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-bold text-gray-900">Daily Mood Log</Text>
            <TouchableOpacity>
              <Feather name="more-horizontal" size={24} color="#999" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {[
              { emoji: '😊', bg: '#FDE68A', label: 'happy' },
              { emoji: '😌', bg: '#A7F3D0', label: 'calm' },
              { emoji: '😐', bg: '#DDD6FE', label: 'neutral' },
              { emoji: '😰', bg: '#93C5FD', label: 'stressed' },
              { emoji: '😔', bg: '#FCA5A5', label: 'sad' },
              { emoji: '😠', bg: '#F87171', label: 'angry' },
            ].map((mood, index) => (
              <TouchableOpacity
                key={index}
                className="w-16 h-16 rounded-full items-center justify-center mr-4 shadow-sm"
                style={{ backgroundColor: mood.bg }}
                onPress={() => handleMoodSelect(mood.label)}
              >
                <Text className="text-3xl">{mood.emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Your Progress */}
        <View className="px-6 mt-10">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-bold text-gray-900">Your progress</Text>
            <TouchableOpacity>
              <Feather name="more-horizontal" size={24} color="#999" />
            </TouchableOpacity>
          </View>
          <View className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-soft flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-6xl font-bold text-gray-900">89%</Text>
              <Text className="text-gray-400 font-medium mt-2 leading-5">
                Of the weekly{"\n"}plan completed
              </Text>
            </View>
            <View className="w-24 h-24 items-center justify-center">
              {/* Pattern mockup */}
              <View className="flex-wrap flex-row w-20 h-20 items-center justify-center">
                {[...Array(16)].map((_, i) => (
                  <View
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full m-0.5 ${i < 12 ? 'bg-[#7ED6A0]' : 'bg-gray-100'}`}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Statistics Section (Bubbles) */}
        <View className="px-6 mt-12 overflow-hidden">
          <Text className="text-gray-400 font-bold tracking-widest text-xs uppercase mb-2">Statistics</Text>
          <Text className="text-3xl font-bold text-gray-900 mb-8">Based on your{"\n"}daily surveys</Text>

          <View className="h-72 items-center justify-center relative mb-4">
            {/* Bubble Chart Mockup - Precisely positioned for aesthetic appeal */}
            <View className="w-36 h-36 rounded-full bg-[#4A90E2] items-center justify-center z-20 shadow-soft border-4 border-white">
              <Text className="text-xs font-bold text-white uppercase tracking-tighter">Gratitude</Text>
            </View>

            <View className="absolute top-0 left-4 w-28 h-28 rounded-full bg-[#7ED6A0] items-center justify-center z-10 shadow-soft border-2 border-white">
              <Text className="text-[10px] font-bold text-white uppercase tracking-tighter">Calmness</Text>
            </View>

            <View className="absolute bottom-8 left-0 w-24 h-24 rounded-full bg-[#FFD93D] items-center justify-center z-10 shadow-soft border-2 border-white">
              <Text className="text-[10px] font-bold text-gray-700 uppercase tracking-tighter">Happiness</Text>
            </View>

            <View className="absolute top-12 right-2 w-32 h-32 rounded-full bg-[#FF6B6B] items-center justify-center z-10 shadow-soft border-2 border-white">
              <Text className="text-[10px] font-bold text-white uppercase tracking-tighter">Love</Text>
            </View>

            <View className="absolute bottom-16 right-0 w-20 h-20 rounded-full bg-[#6C5CE7] items-center justify-center z-10 shadow-soft border-2 border-white">
              <Text className="text-[10px] font-bold text-white uppercase tracking-tighter">Relief</Text>
            </View>

            <View className="absolute bottom-0 right-28 w-14 h-14 rounded-full bg-[#FF7675] items-center justify-center z-10 shadow-soft border-2 border-white">
              <Text className="text-[8px] font-bold text-white uppercase tracking-tighter">Anger</Text>
            </View>
          </View>
        </View>

        {/* Featured Content List */}
        <View className="px-6 mt-10 mb-16">
          {[
            {
              title: 'Diversity And Inclusion',
              bg: '#FDE9E9',
              icon: 'account-group',
              color: '#FF6B6B'
            },
            {
              title: 'Arabic Mental Health',
              bg: '#E2F3EB',
              icon: 'earth',
              color: '#7ED6A0'
            },
            {
              title: 'The Ability to Defend Your Own',
              bg: '#E3EAFB',
              icon: 'shield-check',
              color: '#4A90E2'
            },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              className="rounded-[32px] p-6 mb-5 flex-row items-center justify-between"
              style={{ backgroundColor: item.bg }}
              onPress={handleSupportPress}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-16 h-16 rounded-[20px] bg-white/70 items-center justify-center mr-5 shadow-sm">
                  <MaterialCommunityIcons name={item.icon as any} size={32} color={item.color} />
                </View>
                <Text className="text-xl font-bold text-gray-800 flex-1 leading-6">{item.title}</Text>
              </View>
              <View className="bg-black/10 w-12 h-12 rounded-full items-center justify-center ml-2">
                <Ionicons name="play" size={24} color="#555" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
};

export default HomeScreen;