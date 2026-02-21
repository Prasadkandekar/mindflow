import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SOUNDS = [
    { id: '1', title: 'Rain', icon: 'rainy', color: 'bg-blue-100', iconColor: '#3b82f6' },
    { id: '2', title: 'Fireplace', icon: 'flame', color: 'bg-orange-100', iconColor: '#f97316' },
    { id: '3', title: 'Ocean Waves', icon: 'water', color: 'bg-indigo-100', iconColor: '#6366f1' },
    { id: '4', title: 'Forest Birds', icon: 'leaf', color: 'bg-emerald-100', iconColor: '#10b981' },
    { id: '5', title: 'White Noise', icon: 'radio', color: 'bg-gray-100', iconColor: '#4b5563' },
    { id: '6', title: 'Thunderstorm', icon: 'thunderstorm', color: 'bg-purple-100', iconColor: '#a855f7' },
];

export default function RelaxationSoundsScreen() {
    const router = useRouter();
    const [playingId, setPlayingId] = useState<string | null>(null);

    const SoundCard = ({ item }: { item: typeof SOUNDS[0] }) => (
        <TouchableOpacity
            onPress={() => setPlayingId(playingId === item.id ? null : item.id)}
            className="bg-white p-6 rounded-[32px] mb-4 flex-row items-center justify-between border border-gray-100 shadow-sm"
        >
            <View className="flex-row items-center">
                <View className={`${item.color} w-14 h-14 rounded-2xl items-center justify-center mr-4`}>
                    <Ionicons name={item.icon as any} size={28} color={item.iconColor} />
                </View>
                <Text className="text-gray-900 font-bold text-lg">{item.title}</Text>
            </View>
            <View className={`w-10 h-10 rounded-full items-center justify-center ${playingId === item.id ? 'bg-emerald-500' : 'bg-gray-50'}`}>
                <Ionicons
                    name={playingId === item.id ? "pause" : "play"}
                    size={20}
                    color={playingId === item.id ? "white" : "#9ca3af"}
                />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 pt-4 pb-2 flex-row items-center bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">Relaxation Sounds 🎧</Text>
            </View>

            <ScrollView className="p-6">
                <View className="mb-6">
                    <Text className="text-gray-500 font-medium leading-relaxed">
                        Immersive soundscapes to help you focus, sleep, or meditate.
                    </Text>
                </View>

                {playingId && (
                    <View className="mb-8 p-6 bg-emerald-500 rounded-[32px] flex-row items-center justify-between shadow-lg shadow-emerald-200">
                        <View>
                            <Text className="text-emerald-100 font-bold text-xs uppercase">Now Playing</Text>
                            <Text className="text-white text-xl font-bold">{SOUNDS.find(s => s.id === playingId)?.title}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setPlayingId(null)}>
                            <Ionicons name="close-circle" size={32} color="white" />
                        </TouchableOpacity>
                    </View>
                )}

                {SOUNDS.map((item) => <SoundCard key={item.id} item={item} />)}
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
