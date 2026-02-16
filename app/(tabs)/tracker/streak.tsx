import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function StreakCalendarScreen() {
    const router = useRouter();

    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const dates = [
        { day: 10, completed: true },
        { day: 11, completed: true },
        { day: 12, completed: true },
        { day: 13, completed: true },
        { day: 14, completed: true },
        { day: 15, completed: false },
        { day: 16, completed: true },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">Streak Calendar 📅</Text>
            </View>

            <ScrollView className="p-6">
                <View className="bg-gray-50 p-8 rounded-[40px] mb-8 items-center">
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6 text-center">February 2026</Text>

                    <View className="flex-row justify-between w-full mb-4 px-2">
                        {days.map((day, i) => (
                            <Text key={i} className="text-gray-400 font-bold text-xs">{day}</Text>
                        ))}
                    </View>

                    <View className="flex-row justify-between w-full px-2">
                        {dates.map((item, i) => (
                            <View key={i} className="items-center">
                                <View className={`w-10 h-10 rounded-full items-center justify-center mb-1 ${item.completed ? 'bg-emerald-500' : 'bg-rose-100 border border-rose-200'}`}>
                                    {item.completed ? (
                                        <Ionicons name="checkmark" size={20} color="white" />
                                    ) : (
                                        <Ionicons name="close" size={20} color="#e11d48" />
                                    )}
                                </View>
                                <Text className={`text-[10px] font-bold ${item.completed ? 'text-emerald-600' : 'text-rose-600'}`}>{item.day}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="bg-amber-50 p-6 rounded-[32px] border border-amber-100">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="trending-up" size={24} color="#d97706" />
                        <Text className="text-amber-900 font-bold ml-2 text-lg">Consistency is Key!</Text>
                    </View>
                    <Text className="text-amber-800 leading-relaxed mb-4">
                        You've logged your mood for 6 out of the last 7 days. This helps our AI provide much more accurate insights for your wellbeing.
                    </Text>
                    <TouchableOpacity className="bg-amber-500 py-3 rounded-2xl items-center">
                        <Text className="text-white font-bold">Keep going! 🌿</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
