import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../services/supabase';

const ACTOR_ID = '6ceaaeea-91f5-427d-bb4e-d651e2a2fd61';

interface JournalEntry {
    id: string;
    content: string;
    entry_date: string;
    sentiment_analysis?: {
        sentiment_score: number;
        emotion_label: string;
    };
}

export default function EntryDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [entry, setEntry] = useState<JournalEntry | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchEntryDetails(id as string);
        }
    }, [id]);

    const fetchEntryDetails = async (entryId: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('journals')
                .select(`
                    id,
                    content,
                    entry_date,
                    sentiment_analysis (
                        sentiment_score,
                        emotion_label
                    )
                `)
                .eq('id', entryId)
                .eq('user_id', ACTOR_ID)
                .single();

            if (error) throw error;

            // Format data if needed (handling the array from the join)
            const formattedData = {
                ...data,
                sentiment_analysis: Array.isArray(data.sentiment_analysis)
                    ? data.sentiment_analysis[0]
                    : data.sentiment_analysis
            };

            setEntry(formattedData);
        } catch (error) {
            console.error('Error fetching entry details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#FF7B1B" />
            </SafeAreaView>
        );
    }

    if (!entry) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <Text className="text-gray-500">Entry not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-primary font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const entryDate = new Date(entry.entry_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const sentimentScore = entry.sentiment_analysis?.sentiment_score ?? 0;
    const emotion = entry.sentiment_analysis?.emotion_label ?? 'Neutral';

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">Journal Entry 📖</Text>
            </View>

            <ScrollView className="p-6">
                <View className="mb-8">
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">{entryDate}</Text>
                    <Text className="text-gray-900 text-3xl font-bold">
                        {entry.content.split('\n')[0].substring(0, 30)}
                        {entry.content.split('\n')[0].length > 30 ? '...' : ''}
                    </Text>
                </View>

                <Text className="text-gray-700 text-lg leading-relaxed mb-10">
                    {entry.content}
                </Text>

                <View className="bg-gray-50 p-6 rounded-[32px] mb-8">
                    <Text className="text-gray-900 font-bold text-lg mb-4">Emotion Analysis</Text>

                    <View className="flex-row items-center justify-between mb-6">
                        <View>
                            <Text className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Detected Emotion</Text>
                            <Text className="text-textPrimary font-bold text-xl capitalize">{emotion}</Text>
                        </View>
                        <View className="bg-primary/10 p-3 rounded-2xl">
                            <Ionicons name="sparkles" size={24} color="#FF7B1B" />
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-gray-600">Sentiment Score</Text>
                        <View className="flex-row items-center">
                            <View className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                                <View
                                    className="h-2 bg-primary rounded-full"
                                    style={{ width: `${sentimentScore * 100}%` }}
                                />
                            </View>
                            <Text className="text-primary font-bold">{Math.round(sentimentScore * 100)}%</Text>
                        </View>
                    </View>
                </View>

                <View className="items-center pb-10">
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 text-center">Wellness Impact</Text>
                    <View className="flex-row">
                        {[...Array(5)].map((_, i) => (
                            <Ionicons
                                key={i}
                                name="heart"
                                size={32}
                                color={i < Math.ceil(sentimentScore * 5) ? "#FF7B1B" : "#e2e8f0"}
                                className="mx-1"
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
