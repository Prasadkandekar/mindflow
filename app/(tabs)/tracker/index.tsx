import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../services/supabase';

const ACTOR_ID = '6ceaaeea-91f5-427d-bb4e-d651e2a2fd61';

interface TodayData {
  mood: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  stressLevel: number | null;
  stressTrigger: string | null;
}

const MOOD_EMOJIS: Record<number, string> = {
  1: '😫', 2: '😢', 3: '😞', 4: '😕', 5: '😐',
  6: '🙂', 7: '😊', 8: '😄', 9: '🤩', 10: '🥳',
};

export default function TrackerDashboard() {
  const router = useRouter();
  const [todayData, setTodayData] = useState<TodayData>({
    mood: null, sleepHours: null, sleepQuality: null, stressLevel: null, stressTrigger: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodayData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [moodRes, sleepRes, stressRes] = await Promise.all([
        supabase.from('mood_logs').select('mood_score').eq('user_id', ACTOR_ID).eq('entry_date', today).maybeSingle(),
        supabase.from('sleep_logs').select('sleep_hours, sleep_quality').eq('user_id', ACTOR_ID).eq('entry_date', today).maybeSingle(),
        supabase.from('stress_logs').select('stress_level, trigger').eq('user_id', ACTOR_ID).eq('entry_date', today).maybeSingle(),
      ]);

      setTodayData({
        mood: moodRes.data?.mood_score ?? null,
        sleepHours: sleepRes.data?.sleep_hours ?? null,
        sleepQuality: sleepRes.data?.sleep_quality ?? null,
        stressLevel: stressRes.data?.stress_level ?? null,
        stressTrigger: stressRes.data?.trigger ?? null,
      });
    } catch (error) {
      console.error('Error fetching today data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayData();
  }, [fetchTodayData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTodayData();
  }, [fetchTodayData]);

  // Compute overall wellness percentage
  const computeWellness = () => {
    let total = 0;
    let count = 0;
    if (todayData.mood !== null) { total += todayData.mood * 10; count++; }
    if (todayData.sleepQuality !== null) { total += todayData.sleepQuality * 10; count++; }
    if (todayData.stressLevel !== null) { total += (10 - todayData.stressLevel) * 10; count++; } // invert stress
    return count > 0 ? Math.round(total / count) : null;
  };

  const wellness = computeWellness();
  const getWellnessMessage = () => {
    if (wellness === null) return 'Start logging to see your wellness score.';
    if (wellness >= 80) return 'You\'re doing amazing! Keep it up! ✨';
    if (wellness >= 60) return 'Good progress. Small improvements make big changes.';
    if (wellness >= 40) return 'Your mind needs care, healing, and gentle support.';
    return 'Take it easy today. You deserve rest and compassion. 💛';
  };

  const EmotionBubble = ({ label, size, color, moodIcon, onPress, logged }: {
    label: string; size: number; color: string; moodIcon: any; onPress: () => void; logged: boolean;
  }) => (
    <TouchableOpacity onPress={onPress} className="items-center mx-2">
      <View
        className={`${color} rounded-full items-center justify-center shadow-soft ${logged ? 'border-2 border-white' : ''}`}
        style={{ width: size, height: size }}
      >
        <Ionicons name={moodIcon} size={size * 0.4} color="white" />
      </View>
      <Text className="text-textSecondary text-[10px] mt-2 font-bold uppercase">{label}</Text>
      {logged && (
        <View className="bg-primary w-2 h-2 rounded-full mt-1" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#FF7B1B" />
        <Text className="text-textSecondary mt-4 font-medium">Loading your data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-6 pb-2 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
          <Ionicons name="arrow-back" size={20} color="#2D1E17" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-lg font-bold">Tracker</Text>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
          <Ionicons name="ellipsis-horizontal" size={20} color="#2D1E17" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-6 pb-24"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7B1B" />}
      >
        {/* Wellness Score */}
        <View className="items-center py-8">
          <Text className="text-primary text-[64px] font-bold">
            {wellness !== null ? `${wellness}%` : '—'}
          </Text>
          <Text className="text-textPrimary text-center text-lg font-semibold px-10 mt-2">
            {getWellnessMessage()}
          </Text>
        </View>

        {/* Quick Log Actions */}
        <View className="flex-row justify-center items-end mb-12 h-32">
          <EmotionBubble
            label="Mood"
            size={todayData.mood ? 88 : 56}
            color="bg-primary"
            moodIcon="happy"
            onPress={() => router.push('/tracker/mood-log' as any)}
            logged={todayData.mood !== null}
          />
          <EmotionBubble
            label="Sleep"
            size={todayData.sleepHours ? 88 : 56}
            color="bg-accent"
            moodIcon="moon"
            onPress={() => router.push('/tracker/sleep-log' as any)}
            logged={todayData.sleepHours !== null}
          />
          <EmotionBubble
            label="Stress"
            size={todayData.stressLevel ? 88 : 56}
            color="bg-mood-stressed"
            moodIcon="thunderstorm"
            onPress={() => router.push('/tracker/stress-log' as any)}
            logged={todayData.stressLevel !== null}
          />
        </View>

        {/* Today's Logged Data */}
        <View className="bg-white p-6 rounded-[40px] shadow-card mb-8">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-textPrimary text-xl font-bold">Today's Log</Text>
            <View className="bg-background px-3 py-1.5 rounded-full">
              <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* Mood */}
          <TouchableOpacity
            onPress={() => router.push('/tracker/mood-log' as any)}
            className="flex-row items-center justify-between py-4 border-b border-background"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mr-4">
                <Text className="text-xl">
                  {todayData.mood ? MOOD_EMOJIS[todayData.mood] || '😊' : '😊'}
                </Text>
              </View>
              <View>
                <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider">Mood</Text>
                <Text className="text-textPrimary font-bold text-lg">
                  {todayData.mood ? `${todayData.mood}/10` : 'Not logged'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E7E77" />
          </TouchableOpacity>

          {/* Sleep */}
          <TouchableOpacity
            onPress={() => router.push('/tracker/sleep-log' as any)}
            className="flex-row items-center justify-between py-4 border-b border-background"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-accent/10 items-center justify-center mr-4">
                <Ionicons name="moon" size={22} color="#8B5CF6" />
              </View>
              <View>
                <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider">Sleep</Text>
                <Text className="text-textPrimary font-bold text-lg">
                  {todayData.sleepHours ? `${todayData.sleepHours}h · Quality ${todayData.sleepQuality}/10` : 'Not logged'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E7E77" />
          </TouchableOpacity>

          {/* Stress */}
          <TouchableOpacity
            onPress={() => router.push('/tracker/stress-log' as any)}
            className="flex-row items-center justify-between py-4"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-mood-stressed/10 items-center justify-center mr-4">
                <Ionicons name="thunderstorm" size={22} color="#E67E22" />
              </View>
              <View>
                <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider">Stress</Text>
                <Text className="text-textPrimary font-bold text-lg">
                  {todayData.stressLevel
                    ? `${todayData.stressLevel}/10${todayData.stressTrigger ? ` · ${todayData.stressTrigger}` : ''}`
                    : 'Not logged'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E7E77" />
          </TouchableOpacity>
        </View>

        {/* Bar Chart — now data-driven */}
        <View className="bg-white p-6 rounded-[40px] shadow-card mb-8">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-textPrimary text-xl font-bold">Your statistic</Text>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={20} color="#8E7E77" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-end justify-between px-2 h-48">
            {[
              { label: 'Mood', value: todayData.mood ? todayData.mood * 10 : 0, color: 'bg-primary' },
              { label: 'Sleep', value: todayData.sleepQuality ? todayData.sleepQuality * 10 : 0, color: 'bg-accent' },
              { label: 'Stress', value: todayData.stressLevel ? todayData.stressLevel * 10 : 0, color: 'bg-mood-stressed' },
              { label: 'Wellness', value: wellness ?? 0, color: 'bg-mood-calm' },
            ].map((item, idx) => (
              <View key={idx} className="items-center">
                <View className="w-4 bg-background h-36 rounded-full overflow-hidden justify-end">
                  <View className={`${item.color} rounded-full`} style={{ height: `${item.value}%` }} />
                </View>
                <Text className="text-[10px] font-bold text-textSecondary mt-3">{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Today's Note CTA */}
        <LinearGradient
          colors={['#FF7B1B', '#FFAB73']}
          className="p-6 rounded-[32px] flex-row items-center justify-between"
        >
          <View className="flex-1">
            <Text className="text-white/80 text-xs font-semibold uppercase tracking-wider">Today's note</Text>
            <Text className="text-white text-lg font-bold mt-1">
              {wellness !== null && wellness >= 60
                ? 'Keep It Up and Project Your Mood Now!'
                : 'Take a moment to log how you feel. 💛'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/tracker/mood-log' as any)}
            className="ml-4 w-12 h-12 bg-white/20 rounded-2xl items-center justify-center"
          >
            <Ionicons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        </LinearGradient>
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
