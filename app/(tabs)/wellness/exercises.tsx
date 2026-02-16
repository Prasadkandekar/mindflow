import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function MindBodyExercisesScreen() {
    const router = useRouter();

    const ExerciseCard = ({ title, icon, tag }: { title: string, icon: any, tag: string }) => (
        <TouchableOpacity className="bg-white p-6 rounded-[32px] mb-4 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 rounded-2xl bg-emerald-50 items-center justify-center mr-4">
                    <Ionicons name={icon} size={24} color="#10b981" />
                </View>
                <View>
                    <Text className="text-gray-900 font-bold text-lg">{title}</Text>
                    <Text className="text-emerald-600 text-xs font-bold uppercase">{tag}</Text>
                </View>
            </View>
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color="#9ca3af" />
                    <Text className="text-gray-400 text-xs ml-1">5-10 mins</Text>
                </View>
                <TouchableOpacity className="bg-emerald-500 px-6 py-2 rounded-full">
                    <Text className="text-white font-bold text-xs">Explore</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 pt-4 pb-2 flex-row items-center bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">Mind-Body Exercises 🧘</Text>
            </View>

            <ScrollView className="p-6">
                <View className="mb-6">
                    <Text className="text-gray-500 font-medium">Physical techniques to improve mental clarity and emotional resilience.</Text>
                </View>

                <ExerciseCard title="Grounding Technique" icon="earth" tag="Anxiety Relief" />
                <ExerciseCard title="Progressive Relaxation" icon="body" tag="Stress Management" />
                <ExerciseCard title="Focus Reset" icon="navigate" tag="Productivity" />
                <ExerciseCard title="Gentle Stretching" icon="fitness" tag="Physical Wellness" />
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
