import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../services/supabase';

const ACTOR_ID = '6ceaaeea-91f5-427d-bb4e-d651e2a2fd61';

const STRESS_LEVELS = [
    { level: 1, emoji: '😌', label: 'Zen', color: '#1ABC9C' },
    { level: 2, emoji: '🧘', label: 'Calm', color: '#2ECC71' },
    { level: 3, emoji: '🙂', label: 'Relaxed', color: '#27AE60' },
    { level: 4, emoji: '😊', label: 'Mild', color: '#82C782' },
    { level: 5, emoji: '😐', label: 'Moderate', color: '#F1C40F' },
    { level: 6, emoji: '😕', label: 'Uneasy', color: '#F39C12' },
    { level: 7, emoji: '😰', label: 'Anxious', color: '#E67E22' },
    { level: 8, emoji: '😤', label: 'Stressed', color: '#E74C3C' },
    { level: 9, emoji: '🤯', label: 'Overwhelmed', color: '#C0392B' },
    { level: 10, emoji: '💥', label: 'Breaking', color: '#922B21' },
];

const COMMON_TRIGGERS = [
    { label: 'Work', icon: 'briefcase' },
    { label: 'Studies', icon: 'school' },
    { label: 'Relationships', icon: 'heart' },
    { label: 'Health', icon: 'medkit' },
    { label: 'Finance', icon: 'cash' },
    { label: 'Family', icon: 'people' },
    { label: 'Sleep', icon: 'moon' },
    { label: 'Social', icon: 'chatbubbles' },
    { label: 'Loneliness', icon: 'person' },
    { label: 'Uncertainty', icon: 'help-circle' },
    { label: 'Deadlines', icon: 'timer' },
    { label: 'Other', icon: 'ellipsis-horizontal' },
];

export default function StressLogScreen() {
    const router = useRouter();
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
    const [customTrigger, setCustomTrigger] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const stressData = STRESS_LEVELS.find((s) => s.level === selectedLevel);

    const triggerText =
        selectedTrigger === 'Other' && customTrigger.trim()
            ? customTrigger.trim()
            : selectedTrigger || '';

    const handleSave = async () => {
        if (!selectedLevel) {
            Alert.alert('Select Stress Level', 'Please select your current stress level.');
            return;
        }

        setIsSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            const { error } = await supabase.from('stress_logs').upsert(
                [
                    {
                        user_id: ACTOR_ID,
                        stress_level: selectedLevel,
                        trigger: triggerText || null,
                        entry_date: today,
                    },
                ],
                { onConflict: 'user_id,entry_date' }
            );

            if (error) throw error;

            Alert.alert(
                'Stress Logged! 🧘',
                `Level ${selectedLevel}/10${triggerText ? ` — Trigger: ${triggerText}` : ''}`,
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            console.error('Error saving stress log:', error);
            Alert.alert('Error', error.message || 'Failed to save stress log.');
        } finally {
            setIsSaving(false);
        }
    };

    const getStressBarColor = () => {
        if (!selectedLevel) return '#BDC3C7';
        if (selectedLevel <= 3) return '#27AE60';
        if (selectedLevel <= 6) return '#F39C12';
        return '#E74C3C';
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header */}
                <View className="px-6 py-6 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card"
                        >
                            <Ionicons name="arrow-back" size={20} color="#2D1E17" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold ml-4 text-textPrimary">Log Stress ⚡</Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="px-6">
                    {/* Stress Level Display */}
                    <View className="items-center py-6">
                        <Text className="text-6xl mb-3">{stressData?.emoji || '🧘'}</Text>
                        <Text className="text-textPrimary text-2xl font-bold">
                            {stressData?.label || 'How stressed are you?'}
                        </Text>
                        {selectedLevel && (
                            <View className="w-full mt-5 px-4">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider">
                                        Stress Level
                                    </Text>
                                    <Text
                                        className="font-bold text-sm"
                                        style={{ color: getStressBarColor() }}
                                    >
                                        {selectedLevel}/10
                                    </Text>
                                </View>
                                <View className="h-3 bg-white rounded-full overflow-hidden shadow-card">
                                    <View
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${selectedLevel * 10}%`,
                                            backgroundColor: getStressBarColor(),
                                        }}
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Stress Level Grid */}
                    <View className="bg-white p-6 rounded-[40px] shadow-card mb-6">
                        <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider mb-5 text-center">
                            Select stress intensity
                        </Text>
                        <View className="flex-row flex-wrap justify-center gap-3">
                            {STRESS_LEVELS.map((stress) => (
                                <TouchableOpacity
                                    key={stress.level}
                                    onPress={() => setSelectedLevel(stress.level)}
                                    className={`w-[28%] items-center p-3 rounded-3xl border-2 ${selectedLevel === stress.level
                                            ? 'border-primary bg-primary/5'
                                            : 'border-transparent bg-background'
                                        }`}
                                >
                                    <Text className="text-2xl mb-1">{stress.emoji}</Text>
                                    <Text
                                        className={`text-[9px] font-bold uppercase tracking-wider ${selectedLevel === stress.level ? 'text-primary' : 'text-textSecondary'
                                            }`}
                                    >
                                        {stress.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Trigger Selection */}
                    <View className="bg-white p-6 rounded-[40px] shadow-card mb-6">
                        <View className="flex-row items-center mb-5">
                            <View className="w-10 h-10 rounded-2xl bg-mood-stressed/10 items-center justify-center mr-3">
                                <Ionicons name="flash" size={20} color="#E67E22" />
                            </View>
                            <View>
                                <Text className="text-textPrimary font-bold text-lg">What's causing it?</Text>
                                <Text className="text-textSecondary text-xs">Optional — helps track patterns</Text>
                            </View>
                        </View>
                        <View className="flex-row flex-wrap gap-2">
                            {COMMON_TRIGGERS.map((trigger) => (
                                <TouchableOpacity
                                    key={trigger.label}
                                    onPress={() =>
                                        setSelectedTrigger(
                                            selectedTrigger === trigger.label ? null : trigger.label
                                        )
                                    }
                                    className={`flex-row items-center px-4 py-3 rounded-2xl border-2 ${selectedTrigger === trigger.label
                                            ? 'border-primary bg-primary/5'
                                            : 'border-transparent bg-background'
                                        }`}
                                >
                                    <Ionicons
                                        name={trigger.icon as any}
                                        size={14}
                                        color={selectedTrigger === trigger.label ? '#FF7B1B' : '#8E7E77'}
                                    />
                                    <Text
                                        className={`ml-2 font-bold text-xs ${selectedTrigger === trigger.label ? 'text-primary' : 'text-textSecondary'
                                            }`}
                                    >
                                        {trigger.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Custom trigger input */}
                        {selectedTrigger === 'Other' && (
                            <TextInput
                                placeholder="Describe what's stressing you..."
                                placeholderTextColor="#8E7E77"
                                className="bg-background p-4 rounded-2xl mt-4 text-textPrimary font-medium"
                                value={customTrigger}
                                onChangeText={setCustomTrigger}
                            />
                        )}
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSaving || !selectedLevel}
                        className={`py-5 rounded-[24px] items-center shadow-soft mb-6 ${selectedLevel ? 'bg-primary' : 'bg-textSecondary/30'
                            }`}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <View className="flex-row items-center">
                                <Ionicons name="checkmark-circle" size={20} color="white" />
                                <Text className="text-white font-bold ml-2 text-lg">Save Stress Log</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Coping Card */}
                    <LinearGradient
                        colors={['#E67E22', '#F39C12']}
                        className="p-6 rounded-[32px] flex-row items-center justify-between mb-24"
                    >
                        <View className="flex-1">
                            <Text className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                                Coping Tip 🧠
                            </Text>
                            <Text className="text-white text-lg font-bold mt-1">
                                Try the 4-7-8 breathing technique: Inhale 4s, hold 7s, exhale 8s.
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/wellness/breathing' as any)}
                            className="ml-4 w-12 h-12 bg-white/20 rounded-2xl items-center justify-center"
                        >
                            <Ionicons name="arrow-forward" size={24} color="white" />
                        </TouchableOpacity>
                    </LinearGradient>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
