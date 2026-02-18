import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function ActiveSessionScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-6 py-6 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <View className="w-2.5 h-2.5 rounded-full bg-primary mr-3 shadow-soft" />
                    <Text className="text-textPrimary font-bold text-lg">Listening...</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card"
                >
                    <Ionicons name="close" size={24} color="#2D1E17" />
                </TouchableOpacity>
            </View>

            <View className="flex-1 items-center justify-center px-6">
                {/* Animated Sound Waves Simulation */}
                <View className="flex-row gap-2 items-center h-32 mb-16">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <View
                            key={i}
                            className="w-2 bg-primary rounded-full shadow-soft"
                            style={{
                                height: Math.random() * 80 + 20,
                                opacity: Math.random() * 0.5 + 0.5
                            }}
                        />
                    ))}
                </View>

                <View className="w-full bg-white p-8 rounded-[40px] shadow-card border border-secondary/10">
                    <Text className="text-textSecondary text-center uppercase tracking-widest font-bold text-[10px] mb-4">Live Transcription</Text>
                    <Text className="text-textPrimary text-2xl font-bold text-center leading-tight">
                        "I've been thinking about the presentation tomorrow and feel slightly anxious..."
                    </Text>

                    <View className="mt-8 flex-row justify-center">
                        <View className="w-2 h-2 rounded-full bg-primary mx-1" />
                        <View className="w-2 h-2 rounded-full bg-primary/40 mx-1" />
                        <View className="w-2 h-2 rounded-full bg-primary/20 mx-1" />
                    </View>
                </View>
            </View>

            <View className="px-10 pb-20">
                <TouchableOpacity
                    onPress={() => router.push('/companion/summary')}
                    className="shadow-soft"
                >
                    <LinearGradient
                        colors={['#FF7B1B', '#FFAB73']}
                        className="p-6 rounded-[32px] items-center"
                    >
                        <Text className="text-white font-bold text-xl">Finish Session</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
