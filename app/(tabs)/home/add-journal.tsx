import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function AddJournalScreen() {
    const router = useRouter();

    const JournalOption = ({ title, desc, icon, color, onPress }: { title: string, desc: string, icon: any, color: string, onPress: () => void }) => (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white p-6 rounded-[40px] mb-6 shadow-card border border-secondary/10 flex-row items-center"
        >
            <View className={`${color} w-20 h-20 rounded-[32px] items-center justify-center mr-6 shadow-soft`}>
                <Ionicons name={icon} size={36} color="white" />
            </View>
            <View className="flex-1">
                <Text className="text-textPrimary font-bold text-xl mb-1">{title}</Text>
                <Text className="text-textSecondary text-sm leading-snug">{desc}</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-background items-center justify-center ml-2">
                <Ionicons name="chevron-forward" size={20} color="#FF7B1B" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-6 py-6 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
                    <Ionicons name="close" size={24} color="#2D1E17" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-textPrimary">New Journal ✨</Text>
                <View className="w-10" />
            </View>

            <View className="flex-1 px-6 justify-center">
                <Text className="text-textPrimary text-3xl font-bold mb-10 text-center">How would you like to record?</Text>

                <JournalOption
                    title="Text Journal"
                    desc="Write down your thoughts and feelings in detail."
                    icon="document-text"
                    color="bg-primary"
                    onPress={() => router.push('/home/text-journal')}
                />

                <JournalOption
                    title="Voice Journal"
                    desc="Speak from the heart and let AI handle the rest."
                    icon="mic"
                    color="bg-accent"
                    onPress={() => router.push('/home/voice-journal')}
                />

                <View className="mt-8 p-6 bg-white rounded-[32px] border border-primary/20 border-dashed items-center">
                    <Text className="text-textSecondary text-center text-sm font-medium italic">
                        "Your thoughts are safe and encrypted here."
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
