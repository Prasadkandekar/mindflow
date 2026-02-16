import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function ActiveSessionScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                    <Text className="text-white font-bold">Listening...</Text>
                </View>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
            </View>

            <View className="flex-1 items-center justify-center">
                {/* Animated Sound Waves could be added here */}
                <View className="flex-row space-x-2 items-center h-20">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <View
                            key={i}
                            className="w-1 bg-emerald-500 rounded-full"
                            style={{ height: Math.random() * 40 + 20 }}
                        />
                    ))}
                </View>

                <View className="mt-8 px-10">
                    <Text className="text-gray-500 text-center uppercase tracking-widest font-bold text-xs mb-4">Transcription Preview</Text>
                    <Text className="text-white text-2xl font-medium text-center leading-tight">
                        "I've been thinking about the presentation tomorrow and feel slightly anxious..."
                    </Text>
                </View>
            </View>

            <View className="p-10">
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/companion/summary')}
                    className="bg-emerald-500 p-6 rounded-[32px] items-center"
                >
                    <Text className="text-white font-bold text-xl">End Session</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
