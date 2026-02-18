import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function VoiceJournalScreen() {
    const router = useRouter();
    const [isRecording, setIsRecording] = useState(false);

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-6 py-6 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
                    <Ionicons name="close" size={24} color="#2D1E17" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-textPrimary">Voice Reflection 🎙️</Text>
                <View className="w-10" />
            </View>

            <View className="flex-1 items-center justify-center px-10">
                {isRecording ? (
                    <View className="items-center">
                        <View className="w-56 h-56 rounded-full bg-primary/10 items-center justify-center mb-8 relative">
                            <View className="w-48 h-48 rounded-full bg-primary/20 items-center justify-center">
                                <LinearGradient
                                    colors={['#FF7B1B', '#FFAB73']}
                                    className="w-36 h-36 rounded-full items-center justify-center shadow-soft"
                                >
                                    <Ionicons name="mic" size={48} color="white" />
                                </LinearGradient>
                            </View>
                            {/* Animated pulses could be added with Reanimated */}
                        </View>
                        <Text className="text-primary text-2xl font-bold mb-2">Recording...</Text>
                        <View className="bg-white px-4 py-1.5 rounded-full border border-secondary/20 shadow-card">
                            <Text className="text-textSecondary font-bold">00:42</Text>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => setIsRecording(true)}
                        className="items-center"
                    >
                        <View className="w-48 h-48 rounded-full bg-white items-center justify-center shadow-card border border-secondary/10 mb-8">
                            <LinearGradient
                                colors={['#FF7B1B', '#FFAB73']}
                                className="w-36 h-36 rounded-full items-center justify-center shadow-soft"
                            >
                                <Ionicons name="mic" size={48} color="white" />
                            </LinearGradient>
                        </View>
                        <Text className="text-textPrimary text-2xl font-bold">Start Recording</Text>
                        <Text className="text-textSecondary mt-2 font-medium">Tap to share your thoughts</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View className="h-1/3 bg-white rounded-t-[48px] px-8 pt-10 shadow-soft border-t border-secondary/10">
                <Text className="text-textSecondary font-bold text-[10px] uppercase tracking-widest mb-4">Transcription (live)</Text>
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <Text className="text-textPrimary text-lg leading-relaxed font-medium">
                        {isRecording ? "Today was quite a productive day at work, but I'm feeling a bit overwhelmed by the upcoming deadline. I need to find a way to..." : "Your transcript will appear here as you speak."}
                    </Text>
                </ScrollView>

                {isRecording && (
                    <View className="flex-row gap-4 mt-6 pb-10">
                        <TouchableOpacity
                            onPress={() => setIsRecording(false)}
                            className="flex-1 bg-background py-5 rounded-[24px] items-center border border-secondary/20 shadow-card"
                        >
                            <Text className="text-textPrimary font-bold">Pause</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setIsRecording(false)}
                            className="flex-2 bg-primary py-5 rounded-[24px] items-center shadow-soft"
                        >
                            <Text className="text-white font-bold">Stop & Save</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
