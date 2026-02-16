import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function SessionSummaryScreen() {
    const router = useRouter();

    const EmotionBadge = ({ label, color }: { label: string, color: string }) => (
        <View className={`${color} px-4 py-2 rounded-full mr-2 mb-2`}>
            <Text className="text-white font-bold text-xs uppercase">{label}</Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 pt-4 pb-2 border-b border-gray-100">
                <Text className="text-2xl font-bold">Session Summary 🧾</Text>
            </View>

            <ScrollView className="p-6">
                <View className="bg-gray-50 p-8 rounded-[40px] items-center mb-8">
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Duration</Text>
                    <Text className="text-gray-900 text-4xl font-bold">04:12</Text>
                </View>

                <View className="mb-8">
                    <Text className="text-gray-900 text-xl font-bold mb-4">Key Emotions Detected</Text>
                    <View className="flex-row flex-wrap">
                        <EmotionBadge label="Stress" color="bg-rose-500" />
                        <EmotionBadge label="Anxiety" color="bg-orange-500" />
                        <EmotionBadge label="Determination" color="bg-indigo-500" />
                    </View>
                </View>

                <View className="bg-emerald-50 p-6 rounded-[32px] mb-8 border border-emerald-100">
                    <View className="flex-row items-center mb-3">
                        <View className="w-8 h-8 rounded-full bg-emerald-500 items-center justify-center mr-3">
                            <Ionicons name="leaf" size={16} color="white" />
                        </View>
                        <Text className="text-emerald-900 font-bold text-lg">Suggestion</Text>
                    </View>
                    <Text className="text-emerald-800 text-base leading-relaxed">
                        Based on your anxiety levels about tomorrow's presentation, try a 3-minute box breathing exercise to calm your nervous system.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/wellness/breathing')}
                        className="mt-4 bg-emerald-500 py-3 rounded-2xl items-center"
                    >
                        <Text className="text-white font-bold">Try Breathing Exercise</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => router.push('/companion')}
                    className="bg-gray-900 p-5 rounded-[24px] items-center mb-10"
                >
                    <Text className="text-white font-bold text-lg">Done</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
