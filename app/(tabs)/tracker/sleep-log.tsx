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

const QUALITY_OPTIONS = [
    { score: 1, emoji: '😵', label: 'Terrible' },
    { score: 2, emoji: '😫', label: 'Very Poor' },
    { score: 3, emoji: '😞', label: 'Poor' },
    { score: 4, emoji: '😕', label: 'Below Avg' },
    { score: 5, emoji: '😐', label: 'Average' },
    { score: 6, emoji: '🙂', label: 'Decent' },
    { score: 7, emoji: '😊', label: 'Good' },
    { score: 8, emoji: '😴', label: 'Great' },
    { score: 9, emoji: '🌙', label: 'Excellent' },
    { score: 10, emoji: '⭐', label: 'Perfect' },
];

const HOUR_OPTIONS = [3, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 10, 11, 12];

export default function SleepLogScreen() {
    const router = useRouter();
    const [selectedHours, setSelectedHours] = useState<number | null>(null);
    const [selectedQuality, setSelectedQuality] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const qualityData = QUALITY_OPTIONS.find((q) => q.score === selectedQuality);

    const handleSave = async () => {
        if (!selectedHours || !selectedQuality) {
            Alert.alert('Missing Info', 'Please select both sleep duration and quality.');
            return;
        }

        setIsSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            const { error } = await supabase.from('sleep_logs').upsert(
                [
                    {
                        user_id: ACTOR_ID,
                        sleep_hours: selectedHours,
                        sleep_quality: selectedQuality,
                        entry_date: today,
                    },
                ],
                { onConflict: 'user_id,entry_date' }
            );

            if (error) throw error;

            Alert.alert('Sleep Logged! 🌙', `${selectedHours}hrs with ${qualityData?.label.toLowerCase()} quality.`, [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            console.error('Error saving sleep log:', error);
            Alert.alert('Error', error.message || 'Failed to save sleep log.');
        } finally {
            setIsSaving(false);
        }
    };

    const getSleepMessage = () => {
        if (!selectedHours) return 'How did you sleep last night?';
        if (selectedHours < 5) return 'That\'s quite low. Try to rest more tonight.';
        if (selectedHours < 7) return 'A bit under. Aim for 7-9 hours tonight.';
        if (selectedHours <= 9) return 'Great amount of sleep! 🌟';
        return 'That\'s a lot! Quality matters more than quantity.';
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
                    <Text className="text-xl font-bold ml-4 text-textPrimary">Log Sleep 🌙</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="px-6">
                {/* Summary Header */}
                <View className="items-center py-6">
                    <Text className="text-5xl mb-3">{selectedHours ? '🌙' : '😴'}</Text>
                    <Text className="text-textPrimary text-2xl font-bold text-center">{getSleepMessage()}</Text>
                    {selectedHours && (
                        <View className="flex-row items-center mt-3 gap-3">
                            <View className="bg-white px-5 py-2 rounded-full shadow-card border border-secondary/10">
                                <Text className="text-accent font-bold text-lg">{selectedHours} hrs</Text>
                            </View>
                            {selectedQuality && (
                                <View className="bg-white px-5 py-2 rounded-full shadow-card border border-secondary/10">
                                    <Text className="text-primary font-bold text-lg">{qualityData?.emoji} {selectedQuality}/10</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Sleep Duration */}
                <View className="bg-white p-6 rounded-[40px] shadow-card mb-6">
                    <View className="flex-row items-center mb-5">
                        <View className="w-10 h-10 rounded-2xl bg-accent/10 items-center justify-center mr-3">
                            <Ionicons name="time" size={20} color="#8B5CF6" />
                        </View>
                        <Text className="text-textPrimary font-bold text-lg">Hours Slept</Text>
                    </View>
                    <View className="flex-row flex-wrap justify-center gap-2">
                        {HOUR_OPTIONS.map((hours) => (
                            <TouchableOpacity
                                key={hours}
                                onPress={() => setSelectedHours(hours)}
                                className={`px-4 py-3 rounded-2xl border-2 ${selectedHours === hours
                                        ? 'border-accent bg-accent/10'
                                        : 'border-transparent bg-background'
                                    }`}
                            >
                                <Text
                                    className={`font-bold text-sm ${selectedHours === hours ? 'text-accent' : 'text-textSecondary'
                                        }`}
                                >
                                    {hours}h
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Sleep Quality */}
                <View className="bg-white p-6 rounded-[40px] shadow-card mb-6">
                    <View className="flex-row items-center mb-5">
                        <View className="w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center mr-3">
                            <Ionicons name="star" size={20} color="#FF7B1B" />
                        </View>
                        <Text className="text-textPrimary font-bold text-lg">Sleep Quality</Text>
                    </View>
                    <View className="flex-row flex-wrap justify-center gap-3">
                        {QUALITY_OPTIONS.map((quality) => (
                            <TouchableOpacity
                                key={quality.score}
                                onPress={() => setSelectedQuality(quality.score)}
                                className={`w-[28%] items-center p-3 rounded-3xl border-2 ${selectedQuality === quality.score
                                        ? 'border-primary bg-primary/5'
                                        : 'border-transparent bg-background'
                                    }`}
                            >
                                <Text className="text-2xl mb-1">{quality.emoji}</Text>
                                <Text
                                    className={`text-[9px] font-bold uppercase tracking-wider ${selectedQuality === quality.score ? 'text-primary' : 'text-textSecondary'
                                        }`}
                                >
                                    {quality.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving || !selectedHours || !selectedQuality}
                    className={`py-5 rounded-[24px] items-center shadow-soft mb-6 ${selectedHours && selectedQuality ? 'bg-accent' : 'bg-textSecondary/30'
                        }`}
                >
                    {isSaving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <View className="flex-row items-center">
                            <Ionicons name="moon" size={20} color="white" />
                            <Text className="text-white font-bold ml-2 text-lg">Save Sleep Log</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Tip Card */}
                <LinearGradient
                    colors={['#8B5CF6', '#A78BFA']}
                    className="p-6 rounded-[32px] flex-row items-center justify-between mb-24"
                >
                    <View className="flex-1">
                        <Text className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                            Sleep Tip 💤
                        </Text>
                        <Text className="text-white text-lg font-bold mt-1">
                            Adults need 7-9 hours of quality sleep for optimal mental health.
                        </Text>
                    </View>
                    <View className="ml-4 w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
                        <Ionicons name="bed" size={24} color="white" />
                    </View>
                </LinearGradient>
            </ScrollView>
        </SafeAreaView>
    );
}
