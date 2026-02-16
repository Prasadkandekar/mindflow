import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function AddJournalScreen() {
    const router = useRouter();

    const JournalOption = ({ title, desc, icon, color, onPress }: { title: string, desc: string, icon: any, color: string, onPress: () => void }) => (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white p-8 rounded-[40px] mb-6 border border-gray-100 items-center"
            style={{ elevation: 2 }}
        >
            <View className={`${color} w-20 h-20 rounded-[30px] items-center justify-center mb-6 shadow-lg shadow-${color.split('-')[1]}-200`}>
                <Ionicons name={icon} size={40} color="white" />
            </View>
            <Text className="text-gray-900 font-bold text-2xl mb-2">{title}</Text>
            <Text className="text-gray-500 text-center text-base">{desc}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 pt-4 pb-2 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">New Journal ✨</Text>
            </View>

            <View className="flex-1 justify-center px-10">
                <Text className="text-gray-900 text-3xl font-bold mb-10 text-center">Choose Type</Text>

                <JournalOption
                    title="Text Journal"
                    desc="Write down your thoughts and feelings."
                    icon="document-text"
                    color="bg-emerald-500"
                    onPress={() => router.push('/home/text-journal')}
                />

                <JournalOption
                    title="Voice Journal"
                    desc="Speak from the heart and let us transcribe."
                    icon="mic"
                    color="bg-indigo-500"
                    onPress={() => router.push('/home/voice-journal')}
                />
            </View>
        </SafeAreaView>
    );
}
