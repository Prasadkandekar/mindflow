import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function TrackingSnapshot() {
    const router = useRouter();

    const StatCard = ({ icon, label, value, color, unit }: { icon: any, label: string, value: string, color: string, unit?: string }) => (
        <View className="bg-white p-6 rounded-[40px] mb-4 shadow-card border border-secondary/10 flex-row items-center justify-between">
            <View className="flex-row items-center">
                <View className={`${color} w-14 h-14 rounded-2xl items-center justify-center mr-4 shadow-soft`}>
                    <Ionicons name={icon} size={28} color="white" />
                </View>
                <View>
                    <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider">{label}</Text>
                    <View className="flex-row items-baseline mt-0.5">
                        <Text className="text-textPrimary text-2xl font-bold">{value}</Text>
                        {unit && <Text className="text-textSecondary ml-1 text-xs font-bold">{unit}</Text>}
                    </View>
                </View>
            </View>
            <View className="bg-background px-4 py-1.5 rounded-full border border-secondary/20">
                <Text className="text-primary text-[10px] font-bold uppercase tracking-widest">Stable</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-6 py-6 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
                        <Ionicons name="arrow-back" size={20} color="#2D1E17" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold ml-4 text-textPrimary">Today's Overview 📊</Text>
                </View>
                <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
                    <Ionicons name="calendar-outline" size={20} color="#2D1E17" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="px-6">
                <StatCard icon="happy" label="Mood" value="6" color="bg-primary" unit="/10" />
                <StatCard icon="bed" label="Sleep" value="7.5" color="bg-accent" unit="hrs" />
                <StatCard icon="thunderstorm" label="Stress" value="5" color="bg-mood-stressed" unit="/10" />
                <StatCard icon="walk" label="Steps" value="6,432" color="bg-mood-calm" />

                <TouchableOpacity
                    onPress={() => router.push('/tracker')}
                    className="mt-6 bg-primary p-6 rounded-[32px] items-center shadow-soft"
                >
                    <Text className="text-white font-bold text-lg">View Full Tracker</Text>
                </TouchableOpacity>

                <View className="mt-8 p-8 bg-white rounded-[40px] shadow-card border border-primary/10 mb-20">
                    <View className="flex-row items-center mb-3">
                        <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                            <Ionicons name="sparkles" size={18} color="#FF7B1B" />
                        </View>
                        <Text className="text-textPrimary font-bold text-lg">AI Insights</Text>
                    </View>
                    <Text className="text-textSecondary leading-relaxed text-sm font-medium">
                        Your stress levels are slightly higher than yesterday. Taking a 5-minute breathing break might help you re-center.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
