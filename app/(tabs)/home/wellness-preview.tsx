import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function WellnessPreview() {
    const router = useRouter();

    const SuggestionCard = ({ title, icon, color }: { title: string, icon: any, color: string }) => (
        <TouchableOpacity className="bg-white p-5 rounded-[32px] mb-4 flex-row items-center border border-gray-100">
            <View className={`${color} w-14 h-14 rounded-2xl items-center justify-center mr-4`}>
                <Ionicons name={icon} size={28} color="white" />
            </View>
            <View className="flex-1">
                <View className="flex-row items-center">
                    <Ionicons name="sparkles" size={14} color="#fbbf24" className="mr-1" />
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Recommended</Text>
                </View>
                <Text className="text-gray-900 font-bold text-lg">{title}</Text>
            </View>
            <Ionicons name="play-circle" size={32} color="#cbd5e1" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 pt-4 pb-2 flex-row items-center bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">Suggested For You 🌿</Text>
            </View>

            <ScrollView className="p-6">
                <View className="mb-6">
                    <Text className="text-gray-900 text-2xl font-bold mb-2">Based on your mood</Text>
                    <Text className="text-gray-500 font-medium">We've selected these activities to help you relax today.</Text>
                </View>

                <SuggestionCard title="3-min Breathing" icon="air" color="bg-blue-400" />
                <SuggestionCard title="Relaxation Audio" icon="musical-notes" color="bg-purple-400" />
                <SuggestionCard title="Gratitude Exercise" icon="heart" color="bg-rose-400" />

                <TouchableOpacity
                    onPress={() => router.push('/wellness')}
                    className="mt-6 bg-emerald-500 p-5 rounded-[24px] items-center shadow-lg shadow-emerald-200"
                >
                    <Text className="text-white font-bold text-lg">Explore Wellness Hub</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
