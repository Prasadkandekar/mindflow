import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../services/supabase';

const ACTOR_ID = '6ceaaeea-91f5-427d-bb4e-d651e2a2fd61';

const MOOD_OPTIONS = [
    { score: 1, emoji: '😫', label: 'Awful', color: '#E74C3C' },
    { score: 2, emoji: '😢', label: 'Terrible', color: '#E67E22' },
    { score: 3, emoji: '😞', label: 'Bad', color: '#F39C12' },
    { score: 4, emoji: '😕', label: 'Down', color: '#F1C40F' },
    { score: 5, emoji: '😐', label: 'Meh', color: '#BDC3C7' },
    { score: 6, emoji: '🙂', label: 'Okay', color: '#A8D8A8' },
    { score: 7, emoji: '😊', label: 'Good', color: '#82C782' },
    { score: 8, emoji: '😄', label: 'Great', color: '#27AE60' },
    { score: 9, emoji: '🤩', label: 'Amazing', color: '#2ECC71' },
    { score: 10, emoji: '🥳', label: 'Fantastic', color: '#1ABC9C' },
];

export default function MoodLogScreen() {
    const router = useRouter();
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const selectedMoodData = MOOD_OPTIONS.find((m) => m.score === selectedMood);

    const handleSave = async () => {
        if (!selectedMood) {
            Alert.alert('Select a Mood', 'Please select how you are feeling before saving.');
            return;
        }

        setIsSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            const { error } = await supabase.from('mood_logs').upsert(
                [
                    {
                        user_id: ACTOR_ID,
                        mood_score: selectedMood,
                        entry_date: today,
                    },
                ],
                { onConflict: 'user_id,entry_date' }
            );

            if (error) throw error;

            Alert.alert('Mood Logged! 🎉', `You're feeling ${selectedMoodData?.label.toLowerCase()} today.`, [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            console.error('Error saving mood log:', error);
            Alert.alert('Error', error.message || 'Failed to save mood log.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="px-6 py-6 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card"
                    >
                        <Ionicons name="arrow-back" size={20} color="#2D1E17" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold ml-4 text-textPrimary">Log Mood 😊</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="px-6">
                {/* Selected Mood Display */}
                <View className="items-center py-8">
                    <Text className="text-7xl mb-4">{selectedMoodData?.emoji || '🤔'}</Text>
                    <Text className="text-textPrimary text-2xl font-bold">
                        {selectedMoodData?.label || 'How are you feeling?'}
                    </Text>
                    {selectedMood && (
                        <View className="bg-white px-5 py-2 rounded-full mt-3 shadow-card border border-secondary/10">
                            <Text className="text-primary font-bold text-lg">{selectedMood}/10</Text>
                        </View>
                    )}
                </View>

                {/* Mood Grid */}
                <View className="bg-white p-6 rounded-[40px] shadow-card mb-6">
                    <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider mb-5 text-center">
                        Select your mood
                    </Text>
                    <View className="flex-row flex-wrap justify-center gap-3">
                        {MOOD_OPTIONS.map((mood) => (
                            <TouchableOpacity
                                key={mood.score}
                                onPress={() => setSelectedMood(mood.score)}
                                className={`w-[28%] items-center p-4 rounded-3xl border-2 ${selectedMood === mood.score
                                        ? 'border-primary bg-primary/5'
                                        : 'border-transparent bg-background'
                                    }`}
                            >
                                <Text className="text-3xl mb-1">{mood.emoji}</Text>
                                <Text
                                    className={`text-[10px] font-bold uppercase tracking-wider ${selectedMood === mood.score ? 'text-primary' : 'text-textSecondary'
                                        }`}
                                >
                                    {mood.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving || !selectedMood}
                    className={`py-5 rounded-[24px] items-center shadow-soft mb-6 ${selectedMood ? 'bg-primary' : 'bg-textSecondary/30'
                        }`}
                >
                    {isSaving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle" size={20} color="white" />
                            <Text className="text-white font-bold ml-2 text-lg">Save Mood</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Inspirational Card */}
                <LinearGradient
                    colors={['#FF7B1B', '#FFAB73']}
                    className="p-6 rounded-[32px] flex-row items-center justify-between mb-24"
                >
                    <View className="flex-1">
                        <Text className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                            Daily Reminder
                        </Text>
                        <Text className="text-white text-lg font-bold mt-1">
                            Every emotion is valid. Track to understand yourself better.
                        </Text>
                    </View>
                    <View className="ml-4 w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
                        <Ionicons name="heart" size={24} color="white" />
                    </View>
                </LinearGradient>
            </ScrollView>
        </SafeAreaView>
    );
}
