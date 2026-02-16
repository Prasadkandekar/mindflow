import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function VoiceJournalScreen() {
    const router = useRouter();
    const [isRecording, setIsRecording] = useState(false);

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-white">Voice Reflection 🎙️</Text>
                <View className="w-8" />
            </View>

            <View className="flex-1 items-center justify-center px-10">
                {isRecording ? (
                    <View className="items-center">
                        <View className="w-40 h-40 rounded-full bg-rose-500/20 items-center justify-center mb-8">
                            <View className="w-32 h-32 rounded-full bg-rose-500/40 items-center justify-center animate-pulse">
                                <View className="w-24 h-24 rounded-full bg-rose-500 items-center justify-center">
                                    <Ionicons name="mic" size={48} color="white" />
                                </View>
                            </View>
                        </View>
                        <Text className="text-rose-400 text-xl font-bold mb-2">Recording...</Text>
                        <Text className="text-gray-400">00:42</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => setIsRecording(true)}
                        className="items-center"
                    >
                        <LinearGradient
                            colors={['#10b981', '#059669']}
                            className="w-32 h-32 rounded-full items-center justify-center mb-6 shadow-xl shadow-emerald-900"
                        >
                            <Ionicons name="mic" size={48} color="white" />
                        </LinearGradient>
                        <Text className="text-white text-xl font-bold">Start Recording</Text>
                        <Text className="text-gray-500 mt-2">Tap to share your thoughts</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View className="h-1/3 bg-gray-800/50 rounded-t-[40px] px-8 pt-8 pb-10">
                <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Transcript (live)</Text>
                <ScrollView className="flex-1">
                    <Text className="text-white text-lg leading-relaxed opacity-80">
                        {isRecording ? "Today was quite a productive day at work, but I'm feeling a bit overwhelmed by the upcoming deadline. I need to find a way to..." : "Your transcript will appear here as you speak."}
                    </Text>
                </ScrollView>

                {isRecording && (
                    <View className="flex-row space-x-4 mt-6">
                        <TouchableOpacity
                            onPress={() => setIsRecording(false)}
                            className="flex-1 bg-white/10 py-4 rounded-2xl items-center"
                        >
                            <Text className="text-white font-bold">Pause</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setIsRecording(false)}
                            className="flex-1 bg-red-500 py-4 rounded-2xl items-center"
                        >
                            <Text className="text-white font-bold">Stop & Save</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
