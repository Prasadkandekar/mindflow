import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function BreathingExercisesScreen() {
    const router = useRouter();

    const ExerciseItem = ({ title, duration, type }: { title: string, duration: string, type: string }) => (
        <TouchableOpacity className="bg-white p-6 rounded-[28px] mb-4 flex-row items-center justify-between border border-gray-100 shadow-sm">
            <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center mr-4">
                    <Ionicons name="air" size={24} color="#3b82f6" />
                </View>
                <View>
                    <Text className="text-gray-900 font-bold text-lg">{title}</Text>
                    <View className="flex-row items-center">
                        <Text className="text-gray-400 text-xs mr-2">{duration}</Text>
                        <View className="w-1 h-1 rounded-full bg-gray-300 mr-2" />
                        <Text className="text-blue-500 text-xs font-bold uppercase">{type}</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity className="bg-blue-500 w-10 h-10 rounded-full items-center justify-center">
                <Ionicons name="play" size={20} color="white" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 pt-4 pb-2 flex-row items-center bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">Breathing Exercises 🫁</Text>
            </View>

            <ScrollView className="p-6">
                <View className="mb-8 p-8 bg-blue-600 rounded-[40px] items-center">
                    <Ionicons name="infinite" size={48} color="white" className="mb-4" />
                    <Text className="text-white text-2xl font-bold mb-2">3-min Calm</Text>
                    <Text className="text-blue-100 text-center mb-6">A quick session to regulate your heart rate and settle your mind.</Text>
                    <TouchableOpacity className="bg-white px-10 py-4 rounded-3xl">
                        <Text className="text-blue-600 font-bold text-lg">Start Session</Text>
                    </TouchableOpacity>
                </View>

                <Text className="text-gray-900 text-xl font-bold mb-4">All Exercises</Text>
                <ExerciseItem title="Box Breathing" duration="4 mins" type="Focus" />
                <ExerciseItem title="Stress Relief" duration="5 mins" type="Calm" />
                <ExerciseItem title="Deep Sleep Preparation" duration="10 mins" type="Sleep" />
                <ExerciseItem title="Morning Energy" duration="3 mins" type="Vitality" />
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
