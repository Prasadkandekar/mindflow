import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, PanResponder, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../services/supabase';

const ACTOR_ID = '6ceaaeea-91f5-427d-bb4e-d651e2a2fd61';

const CustomSlider = ({
    label,
    value,
    min,
    max,
    onValueChange,
    icon,
    color,
    unit = ""
}: {
    label: string,
    value: number,
    min: number,
    max: number,
    onValueChange: (val: number) => void,
    icon: string,
    color: string,
    unit?: string
}) => {
    const [sliderWidth, setSliderWidth] = useState(0);
    const [localValue, setLocalValue] = useState(value);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
            const newX = Math.max(0, Math.min(gestureState.moveX - 60, sliderWidth)); // Adjust for padding
            const newValue = Math.round(min + (newX / sliderWidth) * (max - min));
            setLocalValue(newValue);
        },
        onPanResponderRelease: (evt, gestureState) => {
            const newX = Math.max(0, Math.min(evt.nativeEvent.locationX, sliderWidth));
            const newValue = Math.round(min + (newX / sliderWidth) * (max - min));
            onValueChange(newValue);
        },
    });

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <View className="bg-white p-5 rounded-[32px] mb-4 shadow-sm border border-secondary/10">
            <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                    <View className={`${color} w-8 h-8 rounded-xl items-center justify-center mr-3`}>
                        <Ionicons name={icon as any} size={16} color="white" />
                    </View>
                    <Text className="text-textPrimary font-bold">{label}</Text>
                </View>
                <Text className="text-primary font-bold text-lg">{localValue}{unit}</Text>
            </View>
            <View
                className="h-2 bg-background rounded-full relative justify-center"
                onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                {...panResponder.panHandlers}
            >
                <View
                    className={`h-full ${color.replace('bg-', 'bg-')} rounded-full`}
                    style={{ width: `${((localValue - min) / (max - min)) * 100}%` }}
                />
                <View
                    className="w-6 h-6 rounded-full bg-white border-4 border-primary absolute shadow-md"
                    style={{ left: `${((localValue - min) / (max - min)) * 100}%`, marginLeft: -12 }}
                />
            </View>
            <View className="flex-row justify-between mt-2">
                <Text className="text-textSecondary text-[10px] font-bold">{min}{unit}</Text>
                <Text className="text-textSecondary text-[10px] font-bold">{max}{unit}</Text>
            </View>
        </View>
    );
};

const QuickAction = ({ icon, title, onPress, color }: { icon: any, title: string, onPress: () => void, color: string }) => (
    <TouchableOpacity
        onPress={onPress}
        className="bg-white p-4 rounded-3xl shadow-card items-center justify-center flex-1 mx-1.5"
    >
        <View className={`${color} p-3 rounded-2xl mb-2 shadow-soft`}>
            <Ionicons name={icon} size={22} color="white" />
        </View>
        <Text className="text-textPrimary font-semibold text-[10px] text-center">{title}</Text>
    </TouchableOpacity>
);

export default function HomeDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("Pravin");
    const [streak, setStreak] = useState(5);
    const [sleepHours, setSleepHours] = useState(7);
    const [stressLevel, setStressLevel] = useState(3);
    const [wellbeingScore, setWellbeingScore] = useState(84);
    const [aiInsight, setAiInsight] = useState("Loading insights...");

    const fetchData = useCallback(async () => {
        try {
            const today = new Date().toISOString().split('T')[0];

            const [sleepRes, stressRes, moodRes, scoreRes, profileRes, logsRes] = await Promise.all([
                supabase.from('sleep_logs').select('sleep_hours').eq('user_id', ACTOR_ID).eq('entry_date', today).maybeSingle(),
                supabase.from('stress_logs').select('stress_level').eq('user_id', ACTOR_ID).eq('entry_date', today).maybeSingle(),
                supabase.from('mood_logs').select('mood_score').eq('user_id', ACTOR_ID).eq('entry_date', today).maybeSingle(),
                supabase.from('wellbeing_scores').select('composite_score').eq('user_id', ACTOR_ID).order('calculated_at', { ascending: false }).limit(1).maybeSingle(),
                supabase.from('profiles').select('full_name').eq('id', ACTOR_ID).maybeSingle(),
                supabase.from('mood_logs').select('entry_date').eq('user_id', ACTOR_ID).order('entry_date', { ascending: false }),
            ]);

            if (profileRes.data) {
                setUserName(profileRes.data.full_name.split(' ')[0]);
            }

            // Calculate Streak
            if (logsRes.data && logsRes.data.length > 0) {
                let currentStreak = 0;
                let checkDate = new Date();
                checkDate.setHours(0, 0, 0, 0);

                const logDates = new Set(logsRes.data.map(l => l.entry_date));

                // If today isn't logged, streak might still be active from yesterday
                let todayStr = today;
                if (!logDates.has(todayStr)) {
                    checkDate.setDate(checkDate.getDate() - 1);
                }

                while (true) {
                    const dateStr = checkDate.toISOString().split('T')[0];
                    if (logDates.has(dateStr)) {
                        currentStreak++;
                        checkDate.setDate(checkDate.getDate() - 1);
                    } else {
                        break;
                    }
                }
                setStreak(currentStreak);
            }

            const currentSleep = sleepRes.data ? Number(sleepRes.data.sleep_hours) : 7;
            const currentStress = stressRes.data ? Number(stressRes.data.stress_level) : 3;
            const currentMood = moodRes.data ? Number(moodRes.data.mood_score) : 7;

            setSleepHours(currentSleep);
            setStressLevel(currentStress);

            // Compute wellbeing score locally for immediate feedback
            const moodPart = currentMood * 10;
            const stressPart = (10 - currentStress) * 10;
            const sleepPart = Math.min((currentSleep / 8) * 100, 100);
            const computed = Math.round((moodPart + stressPart + sleepPart) / 3);

            setWellbeingScore(computed || 84);

            // Generate a simple AI insight based on data
            let insight = "Track your day to get personalized AI insights and improve your wellbeing.";
            if (currentStress > 7) {
                insight = "Your stress levels are quite high. Consider a short meditation or a walk in nature.";
            } else if (currentSleep < 6) {
                insight = "You might feel a bit tired today. Try to wind down 30 minutes earlier tonight.";
            } else if (computed > 80) {
                insight = "You're doing amazing! Your consistency is paying off. Keep it up! ✨";
            } else if (computed < 50) {
                insight = "It seems like a tough day. Don't forget to take deep breaths and be kind to yourself. 💛";
            }
            setAiInsight(insight);

        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateWellbeingLocally = (sleep: number, stress: number) => {
        const moodPart = 7 * 10; // Assuming neutral mood if not fetched/logged yet
        const stressPart = (10 - stress) * 10;
        const sleepPart = Math.min((sleep / 8) * 100, 100);
        const computed = Math.round((moodPart + stressPart + sleepPart) / 3);
        setWellbeingScore(computed);
    };

    const logSleep = async (hours: number) => {
        setSleepHours(hours);
        updateWellbeingLocally(hours, stressLevel);
        try {
            const today = new Date().toISOString().split('T')[0];
            await supabase.from('sleep_logs').upsert([
                { user_id: ACTOR_ID, sleep_hours: hours, sleep_quality: 7, entry_date: today }
            ], { onConflict: 'user_id,entry_date' });
        } catch (error) {
            console.error('Error logging sleep:', error);
        }
    };

    const logStress = async (level: number) => {
        setStressLevel(level);
        updateWellbeingLocally(sleepHours, level);
        try {
            const today = new Date().toISOString().split('T')[0];
            await supabase.from('stress_logs').upsert([
                { user_id: ACTOR_ID, stress_level: level, entry_date: today }
            ], { onConflict: 'user_id,entry_date' });
        } catch (error) {
            console.error('Error logging stress:', error);
        }
    };

    const logMood = async (score: number) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            await supabase.from('mood_logs').upsert([
                { user_id: ACTOR_ID, mood_score: score, entry_date: today }
            ], { onConflict: 'user_id,entry_date' });
            Alert.alert("Mood Logged", "How you feel matters. Thank you for sharing! ✨");
        } catch (error) {
            console.error('Error logging mood:', error);
        }
    };

    const MOOD_MAP = [
        { icon: 'happy', score: 8, label: 'Happy' },
        { icon: 'sunny', score: 10, label: 'Great' },
        { icon: 'heart', score: 9, label: 'Loved' },
        { icon: 'sad', score: 3, label: 'Sad' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <LinearGradient
                    colors={['#FF7B1B', '#FFAB73']}
                    className="pt-12 pb-24 px-6 rounded-b-[48px]"
                >
                    <View className="flex-row justify-between items-center mb-8">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 rounded-full bg-white/30 border border-white/40 items-center justify-center overflow-hidden">
                                <Ionicons name="person" size={24} color="white" />
                            </View>
                            <View className="ml-3">
                                <View className="bg-white/20 px-3 py-1 rounded-full self-start">
                                    <Text className="text-white text-xs font-medium">Hello, {userName}! 👋</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 border border-white/30 items-center justify-center">
                            <Ionicons name="notifications" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-white text-3xl font-bold leading-tight">How Are You{"\n"}Today?</Text>

                    {/* Emotion Circles */}
                    <View className="flex-row justify-between mt-6">
                        {MOOD_MAP.map((mood, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => logMood(mood.score)}
                                className="w-14 h-14 rounded-full bg-white/30 border border-white/40 items-center justify-center active:bg-white/50"
                            >
                                <Ionicons name={mood.icon as any} size={28} color="white" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </LinearGradient>

                {/* Score Card (Floating) */}
                <View className="px-6 -mt-16">
                    <View className="bg-white p-6 rounded-[40px] shadow-soft border border-secondary/20">
                        <View className="flex-row justify-between items-center">
                            <View>
                                <Text className="text-textSecondary text-sm font-medium">Wellbeing Score</Text>
                                <View className="flex-row items-baseline mt-1">
                                    <Text className="text-primary text-4xl font-bold">{wellbeingScore}</Text>
                                    <Text className="text-textSecondary text-lg font-medium ml-1">/100</Text>
                                </View>
                            </View>
                            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
                                <Ionicons name="sparkles" size={32} color="#FF7B1B" />
                            </View>
                        </View>
                        <View className="h-2 bg-background rounded-full mt-4 overflow-hidden">
                            <View className="h-full bg-primary rounded-full" style={{ width: `${wellbeingScore}%` }} />
                        </View>
                        <Text className="text-textPrimary mt-4 font-semibold text-sm">
                            {wellbeingScore >= 80 ? "You're doing great today! ✨" : wellbeingScore >= 60 ? "Keep going, you're on the right track! 🌟" : "Take some time for yourself today. 💛"}
                        </Text>
                    </View>
                </View>

                <View className="px-6 py-8">
                    {/* Daily Summary */}
                    <View className="mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-textPrimary text-xl font-bold">Daily Summary</Text>
                            <TouchableOpacity>
                                <Text className="text-primary font-bold text-sm">See all</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row gap-3">
                            <View className="bg-secondary/20 p-5 rounded-[32px] flex-1 border border-secondary/30">
                                <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center mb-3">
                                    <Ionicons name="moon" size={20} color="#FF7B1B" />
                                </View>
                                <Text className="text-textPrimary text-xl font-bold">{sleepHours}h</Text>
                                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider">Sleep Duration</Text>
                            </View>
                            <View className="bg-mood-neutral/20 p-5 rounded-[32px] flex-1 border border-mood-neutral/30">
                                <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center mb-3">
                                    <Ionicons name="flame" size={20} color="#FF7B1B" />
                                </View>
                                <Text className="text-textPrimary text-xl font-bold">{streak} Days</Text>
                                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider">Current Streak</Text>
                            </View>
                        </View>
                    </View>

                    {/* Interactive Tracking Sliders */}
                    <View className="mb-8">
                        <Text className="text-textPrimary text-xl font-bold mb-4">Quick Log</Text>
                        <CustomSlider
                            label="Sleep Tonight"
                            value={sleepHours}
                            min={0}
                            max={12}
                            onValueChange={logSleep}
                            icon="moon"
                            color="bg-accent"
                            unit="h"
                        />
                        <CustomSlider
                            label="Stress Level"
                            value={stressLevel}
                            min={1}
                            max={10}
                            onValueChange={logStress}
                            icon="thunderstorm"
                            color="bg-mood-stressed"
                        />
                    </View>

                    {/* AI Insights */}
                    <View className="mb-8 bg-white p-6 rounded-[40px] shadow-card border border-primary/10">
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                                <Ionicons name="sparkles" size={18} color="#FF7B1B" />
                            </View>
                            <Text className="text-textPrimary font-bold text-lg">AI Insights</Text>
                        </View>
                        <Text className="text-textSecondary leading-relaxed text-sm font-medium">
                            {aiInsight}
                        </Text>
                    </View>

                    {/* Quick Actions */}
                    <View className="mb-20">
                        <Text className="text-textPrimary text-xl font-bold mb-4">Quick Actions</Text>
                        <View className="flex-row mb-4">
                            <QuickAction icon="add" title="New Journal" onPress={() => router.push('/home/add-journal')} color="bg-primary" />
                            <QuickAction icon="stats-chart" title="Snapshot" onPress={() => router.push('/home/tracking')} color="bg-accent" />
                            <QuickAction icon="clipboard" title="Assessments" onPress={() => router.push('/home/questionnaires')} color="bg-secondary" />
                        </View>
                        <View className="flex-row">
                            <QuickAction icon="leaf" title="Wellness" onPress={() => router.push('/home/wellness-preview')} color="bg-mood-neutral" />
                            <QuickAction icon="mic" title="Talk to AI" onPress={() => router.push('/companion')} color="bg-primary" />
                            <QuickAction icon="settings" title="Profile" onPress={() => router.push('/home/profile')} color="bg-textSecondary" />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
