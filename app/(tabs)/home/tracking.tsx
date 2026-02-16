import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function TrackingSnapshot() {
    const router = useRouter();

    const StatCard = ({ icon, label, value, color, unit }: { icon: any, label: string, value: string, color: string, unit?: string }) => (
        <View className="bg-white p-6 rounded-[32px] mb-4 shadow-sm border border-gray-50 flex-row items-center justify-between">
            <View className="flex-row items-center">
                <View className={`${color} w-14 h-14 rounded-2xl items-center justify-center mr-4`}>
                    <Ionicons name={icon} size={28} color="white" />
                </View>
                <View>
                    <Text className="text-gray-400 font-medium text-sm">{label}</Text>
                    <View className="flex-row items-baseline">
                        <Text className="text-gray-900 text-2xl font-bold">{value}</Text>
                        {unit && <Text className="text-gray-500 ml-1 text-sm">{unit}</Text>}
                    </View>
                </View>
            </View>
            <View className="bg-gray-50 px-3 py-1 rounded-full">
                <Text className="text-gray-400 text-xs font-bold">Stable</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">Today's Overview 📊</Text>
            </View>

            <ScrollView className="px-6 py-6">
                <StatCard icon="happy" label="Mood" value="6" color="bg-yellow-400" unit="/10" />
                <StatCard icon="bed" label="Sleep" value="7.5" color="bg-indigo-500" unit="hrs" />
                <StatCard icon="thunderstorm" label="Stress" value="5" color="bg-rose-500" unit="/10" />
                <StatCard icon="walk" label="Steps" value="6,432" color="bg-emerald-500" />

                <TouchableOpacity
                    onPress={() => router.push('/tracker')}
                    className="mt-6 bg-emerald-500 p-5 rounded-[24px] items-center shadow-lg shadow-emerald-200"
                >
                    <Text className="text-white font-bold text-lg">View Full Tracker</Text>
                </TouchableOpacity>

                <View className="mt-8 p-6 bg-white rounded-[32px] border border-gray-100">
                    <Text className="text-gray-900 font-bold text-lg mb-2">AI Insights</Text>
                    <Text className="text-gray-600 leading-relaxed">
                        Your stress levels are slightly higher than yesterday. Taking a 5-minute breathing break might help you re-center.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
