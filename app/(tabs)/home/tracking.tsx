import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../services/supabase';

const ACTOR_ID = '6ceaaeea-91f5-427d-bb4e-d651e2a2fd61';

interface TodaySnapshot {
    mood: number | null;
    sleepHours: number | null;
    sleepQuality: number | null;
    stressLevel: number | null;
}

export default function TrackingSnapshot() {
    const router = useRouter();
    const [data, setData] = useState<TodaySnapshot>({
        mood: null, sleepHours: null, sleepQuality: null, stressLevel: null,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const today = new Date().toISOString().split('T')[0];

            const [moodRes, sleepRes, stressRes] = await Promise.all([
                supabase.from('mood_logs').select('mood_score').eq('user_id', ACTOR_ID).eq('entry_date', today).maybeSingle(),
                supabase.from('sleep_logs').select('sleep_hours, sleep_quality').eq('user_id', ACTOR_ID).eq('entry_date', today).maybeSingle(),
                supabase.from('stress_logs').select('stress_level').eq('user_id', ACTOR_ID).eq('entry_date', today).maybeSingle(),
            ]);

            setData({
                mood: moodRes.data?.mood_score ?? null,
                sleepHours: sleepRes.data?.sleep_hours ?? null,
                sleepQuality: sleepRes.data?.sleep_quality ?? null,
                stressLevel: stressRes.data?.stress_level ?? null,
            });
        } catch (error) {
            console.error('Error fetching tracking data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const getStatusLabel = (value: number | null, max: number = 10) => {
        if (value === null) return { label: 'Not Logged', color: 'bg-textSecondary/20' };
        const pct = value / max;
        if (pct >= 0.7) return { label: 'Good', color: 'bg-mood-calm/20' };
        if (pct >= 0.4) return { label: 'Stable', color: 'bg-primary/20' };
        return { label: 'Low', color: 'bg-mood-stressed/20' };
    };

    const getStressStatus = (value: number | null) => {
        if (value === null) return { label: 'Not Logged', color: 'bg-textSecondary/20' };
        if (value <= 3) return { label: 'Low', color: 'bg-mood-calm/20' };
        if (value <= 6) return { label: 'Moderate', color: 'bg-primary/20' };
        return { label: 'High', color: 'bg-mood-stressed/20' };
    };

    const StatCard = ({ icon, label, value, color, unit, status, onPress }: {
        icon: any; label: string; value: string; color: string; unit?: string;
        status: { label: string; color: string }; onPress: () => void;
    }) => (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white p-6 rounded-[40px] mb-4 shadow-card border border-secondary/10 flex-row items-center justify-between"
        >
            <View className="flex-row items-center">
                <View className={`${color} w-14 h-14 rounded-2xl items-center justify-center mr-4 shadow-soft`}>
                    <Ionicons name={icon} size={28} color="white" />
                </View>
                <View>
                    <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider">{label}</Text>
                    <View className="flex-row items-baseline mt-0.5">
                        <Text className="text-textPrimary text-2xl font-bold">{value}</Text>
                        {unit && <Text className="text-textSecondary ml-1 text-xs font-bold">{unit}</Text>}
                    </View>
                </View>
            </View>
            <View className={`${status.color} px-4 py-1.5 rounded-full border border-secondary/20`}>
                <Text className="text-primary text-[10px] font-bold uppercase tracking-widest">{status.label}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#FF7B1B" />
                <Text className="text-textSecondary mt-4 font-medium">Loading snapshot...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-6 py-6 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
                        <Ionicons name="arrow-back" size={20} color="#2D1E17" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold ml-4 text-textPrimary">Today's Overview 📊</Text>
                </View>
                <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
                    <Ionicons name="calendar-outline" size={20} color="#2D1E17" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="px-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7B1B" />}
            >
                <StatCard
                    icon="happy"
                    label="Mood"
                    value={data.mood !== null ? String(data.mood) : '—'}
                    color="bg-primary"
                    unit={data.mood !== null ? '/10' : ''}
                    status={getStatusLabel(data.mood)}
                    onPress={() => router.push('/tracker/mood-log' as any)}
                />
                <StatCard
                    icon="bed"
                    label="Sleep"
                    value={data.sleepHours !== null ? String(data.sleepHours) : '—'}
                    color="bg-accent"
                    unit={data.sleepHours !== null ? 'hrs' : ''}
                    status={getStatusLabel(data.sleepQuality)}
                    onPress={() => router.push('/tracker/sleep-log' as any)}
                />
                <StatCard
                    icon="thunderstorm"
                    label="Stress"
                    value={data.stressLevel !== null ? String(data.stressLevel) : '—'}
                    color="bg-mood-stressed"
                    unit={data.stressLevel !== null ? '/10' : ''}
                    status={getStressStatus(data.stressLevel)}
                    onPress={() => router.push('/tracker/stress-log' as any)}
                />

                <TouchableOpacity
                    onPress={() => router.push('/tracker' as any)}
                    className="mt-6 bg-primary p-6 rounded-[32px] items-center shadow-soft"
                >
                    <Text className="text-white font-bold text-lg">View Full Tracker</Text>
                </TouchableOpacity>

                <View className="mt-8 p-8 bg-white rounded-[40px] shadow-card border border-primary/10 mb-20">
                    <View className="flex-row items-center mb-3">
                        <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                            <Ionicons name="sparkles" size={18} color="#FF7B1B" />
                        </View>
                        <Text className="text-textPrimary font-bold text-lg">AI Insights</Text>
                    </View>
                    <Text className="text-textSecondary leading-relaxed text-sm font-medium">
                        {data.stressLevel !== null && data.stressLevel >= 6
                            ? 'Your stress levels are elevated today. Taking a 5-minute breathing break might help you re-center.'
                            : data.mood !== null && data.mood >= 7
                                ? 'You\'re in a great mood today! Keep up whatever you\'re doing — it\'s working.'
                                : data.sleepHours !== null && data.sleepHours < 6
                                    ? 'You didn\'t get enough sleep. Try to wind down earlier tonight for better rest.'
                                    : 'Log your mood, sleep, and stress to get personalized insights here.'}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
