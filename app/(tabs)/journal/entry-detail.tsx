import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function EntryDetailScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">Journal Entry 📖</Text>
            </View>

            <ScrollView className="p-6">
                <View className="mb-8">
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">February 16, 2026</Text>
                    <Text className="text-gray-900 text-3xl font-bold">Productive Monday</Text>
                </View>

                <Text className="text-gray-700 text-lg leading-relaxed mb-10">
                    Today was quite a productive day at work, but I'm feeling a bit overwhelmed by the upcoming deadline.
                    I managed to finish all my tasks ahead of schedule, which gave me some breathing room.
                    I also had a great conversation with Sarah about the new project.
                    I'm feeling positive but definitely need to find a way to manage the stress as the week progresses.
                </Text>

                <View className="bg-gray-50 p-6 rounded-[32px] mb-8">
                    <Text className="text-gray-900 font-bold text-lg mb-4">Emotion Analysis</Text>
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-gray-600">Stress</Text>
                        <View className="flex-row items-center">
                            <View className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                                <View className="w-20 h-2 bg-rose-500 rounded-full" />
                            </View>
                            <Ionicons name="trending-up" size={16} color="#e11d48" />
                        </View>
                    </View>
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-gray-600">Calm</Text>
                        <View className="flex-row items-center">
                            <View className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                                <View className="w-12 h-2 bg-blue-500 rounded-full" />
                            </View>
                            <Ionicons name="trending-down" size={16} color="#3b82f6" />
                        </View>
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-gray-600">Happiness</Text>
                        <View className="flex-row items-center">
                            <View className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                                <View className="w-24 h-2 bg-emerald-500 rounded-full" />
                            </View>
                            <Ionicons name="arrow-up" size={16} color="#10b981" />
                        </View>
                    </View>
                </View>

                <View className="items-center pb-10">
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 text-center">Your Rating</Text>
                    <View className="flex-row">
                        {[...Array(5)].map((_, i) => (
                            <Ionicons key={i} name="star" size={32} color={i < 4 ? "#fbbf24" : "#e2e8f0"} className="mx-1" />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
