import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function SessionSummaryScreen() {
    const router = useRouter();

    const EmotionBadge = ({ label, color }: { label: string, color: string }) => (
        <View className={`${color} px-4 py-2 rounded-full mr-2 mb-2 shadow-soft`}>
            <Text className="text-white font-bold text-[10px] uppercase tracking-wider">{label}</Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-6 py-6 border-b border-primary/5">
                <Text className="text-2xl font-bold text-textPrimary">Session Summary 🧾</Text>
            </View>

            <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
                <View className="bg-white p-8 rounded-[48px] items-center mb-8 shadow-card border border-secondary/10">
                    <Text className="text-textSecondary font-bold text-[10px] uppercase tracking-widest mb-2">Total Duration</Text>
                    <Text className="text-textPrimary text-5xl font-bold">04:12</Text>
                </View>

                <View className="mb-8">
                    <Text className="text-textPrimary text-xl font-bold mb-4">Key Emotions Detected</Text>
                    <View className="flex-row flex-wrap">
                        <EmotionBadge label="Stress" color="bg-mood-stressed" />
                        <EmotionBadge label="Anxiety" color="bg-primary" />
                        <EmotionBadge label="Determination" color="bg-mood-calm" />
                    </View>
                </View>

                <View className="bg-white p-6 rounded-[40px] mb-8 border border-primary/10 shadow-card">
                    <View className="flex-row items-center mb-4">
                        <View className="w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center mr-3">
                            <Ionicons name="sparkles" size={20} color="#FF7B1B" />
                        </View>
                        <Text className="text-textPrimary font-bold text-lg">AI Suggestion</Text>
                    </View>
                    <Text className="text-textSecondary text-base leading-relaxed font-medium">
                        Based on your anxiety levels about tomorrow's presentation, try a 3-minute box breathing exercise to calm your nervous system.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/wellness')}
                        className="mt-6 shadow-soft"
                    >
                        <LinearGradient
                            colors={['#FF7B1B', '#FFAB73']}
                            className="py-4 rounded-[24px] items-center"
                        >
                            <Text className="text-white font-bold">Try Breathing Exercise</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => router.push('/companion')}
                    className="bg-textPrimary p-5 rounded-[28px] items-center mb-20 shadow-soft"
                >
                    <Text className="text-white font-bold text-lg">Back to Companion</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
