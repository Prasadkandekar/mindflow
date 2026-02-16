import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AchievementsScreen() {
    const router = useRouter();

    const AchievementBadge = ({ title, icon, color, unlocked = false }: { title: string, icon: any, color: string, unlocked?: boolean }) => (
        <View className="w-[47%] bg-white p-6 rounded-[32px] mb-4 items-center border border-gray-100 shadow-sm relative">
            {!unlocked && <View className="absolute inset-0 bg-white/60 rounded-[32px] items-center justify-center z-10">
                <Ionicons name="lock-closed" size={24} color="#9ca3af" />
            </View>}
            <View className={`${color} w-16 h-16 rounded-3xl items-center justify-center mb-4 shadow-sm`}>
                <Ionicons name={icon} size={32} color="white" />
            </View>
            <Text className="text-gray-900 font-bold text-center text-sm">{title}</Text>
            {unlocked && (
                <View className="mt-2 bg-emerald-50 px-3 py-1 rounded-full">
                    <Text className="text-emerald-600 font-bold text-[10px] uppercase">Unlocked</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 pt-4 pb-2 flex-row items-center bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">Achievements 🏆</Text>
            </View>

            <ScrollView className="p-6">
                <View className="bg-white p-8 rounded-[40px] items-center mb-8 shadow-sm">
                    <Ionicons name="medal" size={64} color="#f59e0b" className="mb-4" />
                    <Text className="text-gray-900 text-2xl font-bold">Level 4</Text>
                    <Text className="text-gray-400 font-medium mb-6">Master of Mindfulness</Text>
                    <View className="w-full h-2 bg-gray-100 rounded-full mb-2">
                        <View className="w-3/4 h-2 bg-amber-500 rounded-full" />
                    </View>
                    <Text className="text-gray-400 text-xs">750 / 1000 XP to Level 5</Text>
                </View>

                <Text className="text-gray-900 text-xl font-bold mb-6">Your Badges</Text>

                <View className="flex-row flex-wrap justify-between">
                    <AchievementBadge title="7-Day Reflection" icon="calendar" color="bg-emerald-500" unlocked={true} />
                    <AchievementBadge title="Stress Control" icon="leaf" color="bg-indigo-500" unlocked={true} />
                    <AchievementBadge title="Consistency Master" icon="flame" color="bg-orange-500" unlocked={true} />
                    <AchievementBadge title="Early Bird" icon="sunny" color="bg-yellow-400" unlocked={false} />
                    <AchievementBadge title="Zen Warrior" icon="body" color="bg-purple-500" unlocked={false} />
                    <AchievementBadge title="Support Pilllar" icon="people" color="bg-rose-500" unlocked={false} />
                </View>
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
