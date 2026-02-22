
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, PanResponder, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
    const [isSaving, setIsSaving] = useState(false);
    const [isLoggedToday, setIsLoggedToday] = useState(false);
    const [userName, setUserName] = useState("Pravin");
    const [streak, setStreak] = useState(5);
    const [sleepHours, setSleepHours] = useState(7);
    const [stressLevel, setStressLevel] = useState(3);
    const [selectedMood, setSelectedMood] = useState(7);
    const [wellbeingScore, setWellbeingScore] = useState(84);
    const [riskLevel, setRiskLevel] = useState<string>('low');
    const [aiInsight, setAiInsight] = useState("Loading insights...");

    const [weeklyAvg, setWeeklyAvg] = useState({ mood: 0, sleep: 0, stress: 0, wellness: 0 });
    const [recentSentiment, setRecentSentiment] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            const lastWeekStr = lastWeek.toISOString();

            const [sleepRes, stressRes, moodRes, scoreRes, profileRes, logsRes, weeklyRes, journalRes] = await Promise.all([
                supabase.from('sleep_logs').select('sleep_hours, sleep_quality').eq('user_id', ACTOR_ID).eq('entry_date', today).maybeSingle(),
                supabase.from('stress_logs').select('stress_level, trigger').eq('user_id', ACTOR_ID).eq('entry_date', today).maybeSingle(),
                supabase.from('mood_logs').select('mood_score').eq('user_id', ACTOR_ID).eq('entry_date', today).maybeSingle(),
                supabase.from('wellbeing_scores').select('composite_score, risk_level').eq('user_id', ACTOR_ID).order('calculated_at', { ascending: false }).limit(1).maybeSingle(),
                supabase.from('profiles').select('full_name').eq('id', ACTOR_ID).maybeSingle(),
                supabase.from('mood_logs').select('entry_date').eq('user_id', ACTOR_ID).order('entry_date', { ascending: false }),
                supabase.from('wellbeing_scores').select('mood_avg, stress_avg, sleep_avg, composite_score').eq('user_id', ACTOR_ID).gte('calculated_at', lastWeekStr),
                supabase.from('journals').select('id, content, sentiment_analysis(emotion_label)').eq('user_id', ACTOR_ID).order('created_at', { ascending: false }).limit(3)
            ]);

            if (profileRes.data?.full_name) {
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

            // Calculate Weekly Averages
            if (weeklyRes.data && weeklyRes.data.length > 0) {
                const count = weeklyRes.data.length;
                const sums = weeklyRes.data.reduce((acc, curr) => ({
                    mood: acc.mood + (curr.mood_avg || 0),
                    stress: acc.stress + (curr.stress_avg || 0),
                    sleep: acc.sleep + (curr.sleep_avg || 0),
                    wellness: acc.wellness + (curr.composite_score || 0)
                }), { mood: 0, stress: 0, sleep: 0, wellness: 0 });

                setWeeklyAvg({
                    mood: Math.round(sums.mood / count),
                    stress: Math.round(sums.stress / count),
                    sleep: Math.round(sums.sleep / count),
                    wellness: Math.round(sums.wellness / count)
                });
            }

            if (journalRes.data && journalRes.data.length > 0) {
                // @ts-ignore - sentiment_analysis is a join
                const sentiments = journalRes.data.map(j => j.sentiment_analysis?.[0]?.emotion_label || j.sentiment_analysis?.emotion_label).filter(Boolean);
                if (sentiments.length > 0) setRecentSentiment(sentiments[0]);
            }

            const currentSleep = sleepRes.data ? Number(sleepRes.data.sleep_hours) : 7;
            const currentStress = stressRes.data ? Number(stressRes.data.stress_level) : 3;
            const currentMood = moodRes.data ? Number(moodRes.data.mood_score) : null;

            if (moodRes.data && sleepRes.data && stressRes.data) {
                setIsLoggedToday(true);
            }

            setSleepHours(currentSleep);
            setStressLevel(currentStress);
            setSelectedMood(currentMood ?? 7);

            if (scoreRes.data) {
                setWellbeingScore(Number(scoreRes.data.composite_score));
                setRiskLevel(scoreRes.data.risk_level || 'low');
            }

            // Compute wellbeing score locally for immediate feedback
            const moodPart = (currentMood || 7) * 10;
            const stressPart = (10 - currentStress) * 10;
            const sleepPart = Math.min((currentSleep / 8) * 100, 100);
            const computed = Math.round((moodPart + stressPart + sleepPart) / 3);

            setWellbeingScore(isNaN(computed) ? 84 : computed);

            // Generate Dynamic AI insight based on weekly and sentiment data
            let insight = "Track your day to get personalized AI insights and improve your wellbeing.";
            if (currentStress > 7) {
                insight = "Your stress levels are quite high today. Consider a short meditation or a walk in nature.";
            } else if (recentSentiment === 'sad' || recentSentiment === 'anxious') {
                insight = `We noticed you've been feeling slightly ${recentSentiment} in your journals. Taking a moment for self-care can help.`;
            } else if (currentSleep < 6) {
                insight = "You might feel a bit tired today. Try to wind down 30 minutes earlier tonight.";
            } else if (weeklyAvg.wellness > 80) {
                insight = "You've had a great week! Your consistency in maintaining high wellbeing is impressive. ✨";
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
    }, [weeklyAvg.wellness, recentSentiment]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateWellbeingLocally = (sleep: number, stress: number, mood: number) => {
        const moodPart = mood * 10;
        const stressPart = (10 - stress) * 10;
        const sleepPart = Math.min((sleep / 8) * 100, 100);
        const computed = Math.round((moodPart + stressPart + sleepPart) / 3);
        setWellbeingScore(computed);
    };

    const handleSleepChange = (hours: number) => {
        setSleepHours(hours);
        updateWellbeingLocally(hours, stressLevel, selectedMood || 7);
    };

    const handleStressChange = (level: number) => {
        setStressLevel(level);
        updateWellbeingLocally(sleepHours, level, selectedMood || 7);
    };

    const handleMoodSelect = (score: number) => {
        setSelectedMood(score);
        updateWellbeingLocally(sleepHours, stressLevel, score);
    };

    const handleFinalSave = async () => {

        setIsSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            // Calculate metrics for wellbeing_scores
            const moodPart = selectedMood * 10;
            const stressPart = (10 - stressLevel) * 10;
            const sleepPart = Math.min((sleepHours / 8) * 100, 100);
            const composite = Math.round((moodPart + stressPart + sleepPart) / 3);

            let risk = 'low';
            if (composite < 40) risk = 'high';
            else if (composite < 70) risk = 'medium';

            // Delete any existing entries for today first
            await Promise.all([
                supabase.from('mood_logs').delete().eq('user_id', ACTOR_ID).eq('entry_date', today),
                supabase.from('sleep_logs').delete().eq('user_id', ACTOR_ID).eq('entry_date', today),
                supabase.from('stress_logs').delete().eq('user_id', ACTOR_ID).eq('entry_date', today),
            ]);

            // Insert fresh entries
            const { error: moodError } = await supabase.from('mood_logs').insert([
                { user_id: ACTOR_ID, mood_score: selectedMood, entry_date: today }
            ]);

            const { error: sleepError } = await supabase.from('sleep_logs').insert([
                { user_id: ACTOR_ID, sleep_hours: sleepHours, sleep_quality: 7, entry_date: today }
            ]);

            const { error: stressError } = await supabase.from('stress_logs').insert([
                { user_id: ACTOR_ID, stress_level: stressLevel, trigger: 'general', entry_date: today }
            ]);

            const { error: scoreError } = await supabase.from('wellbeing_scores').insert([
                {
                    user_id: ACTOR_ID,
                    mood_avg: selectedMood,
                    stress_avg: stressLevel,
                    sleep_avg: sleepHours,
                    composite_score: composite,
                    risk_level: risk
                }
            ]);

            if (moodError) console.error('Mood save error:', moodError.message);
            if (sleepError) console.error('Sleep save error:', sleepError.message);
            if (stressError) console.error('Stress save error:', stressError.message);
            if (scoreError) console.error('Score save error:', scoreError.message);

            if (moodError || sleepError || stressError || scoreError) {
                throw new Error('Some logs failed to save');
            }

            setIsLoggedToday(true);
            Alert.alert("Daily Log Saved", "Your wellbeing today has been recorded. Check back tomorrow! ✨");
        } catch (error) {
            console.error('Error saving daily logs:', error);
            Alert.alert("Error", "Failed to save your daily log. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF9F5' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <LinearGradient
                    colors={['#FF7B1B', '#FFAB73']}
                    style={{ paddingTop: 48, paddingBottom: isLoggedToday ? 64 : 96, paddingHorizontal: 24, borderBottomLeftRadius: 48, borderBottomRightRadius: 48 }}
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

                    <Text className="text-white text-3xl font-bold leading-tight">
                        {isLoggedToday ? "You're All Set\nFor Today!" : "How Are You\nToday?"}
                    </Text>
                </LinearGradient>

                {/* Score Card (Floating) */}
                <View className="px-6 -mt-12">
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

                        {/* Risk Level Badge */}
                        <View className="flex-row items-center mt-2">
                            <View className={`px-3 py-1 rounded-full ${riskLevel === 'high' ? 'bg-mood-stressed/20' : riskLevel === 'medium' ? 'bg-secondary/20' : 'bg-mood-neutral/20'
                                }`}>
                                <Text className={`text-[10px] font-bold uppercase tracking-wider ${riskLevel === 'high' ? 'text-mood-stressed' : riskLevel === 'medium' ? 'text-secondary' : 'text-mood-neutral'
                                    }`}>
                                    {riskLevel} Risk Level
                                </Text>
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
                    {/* Daily & Weekly Summary */}
                    <View className="mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-textPrimary text-xl font-bold">Summary & Analytics</Text>
                            <TouchableOpacity onPress={() => router.push('/tracker')}>
                                <Text className="text-primary font-bold text-sm">Full Stats</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row gap-3 mb-3">
                            <View className="bg-secondary/20 p-5 rounded-[32px] flex-1 border border-secondary/30">
                                <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center mb-3">
                                    <Ionicons name="moon" size={20} color="#FF7B1B" />
                                </View>
                                <Text className="text-textPrimary text-xl font-bold">{sleepHours}h</Text>
                                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider">Today's Sleep</Text>
                            </View>
                            <View className="bg-mood-neutral/20 p-5 rounded-[32px] flex-1 border border-mood-neutral/30">
                                <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center mb-3">
                                    <Ionicons name="flame" size={20} color="#FF7B1B" />
                                </View>
                                <Text className="text-textPrimary text-xl font-bold">{streak} Days</Text>
                                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider">Current Streak</Text>
                            </View>
                        </View>
                        <View className="flex-row gap-3">
                            <View className="bg-primary/10 p-5 rounded-[32px] flex-1 border border-primary/20">
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="text-textPrimary text-lg font-bold">{weeklyAvg.wellness}%</Text>
                                    <Ionicons name="trending-up" size={16} color="#FF7B1B" />
                                </View>
                                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider">Weekly Wellness</Text>
                            </View>
                            <View className="bg-accent/10 p-5 rounded-[32px] flex-1 border border-accent/20">
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="text-textPrimary text-lg font-bold">{weeklyAvg.mood}/10</Text>
                                    <Ionicons name="happy-outline" size={16} color="#8B5CF6" />
                                </View>
                                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider">Avg Mood</Text>
                            </View>
                            <View className="bg-mood-stressed/10 p-5 rounded-[32px] flex-1 border border-mood-stressed/20">
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="text-textPrimary text-lg font-bold">{weeklyAvg.stress}/10</Text>
                                    <Ionicons name="warning-outline" size={16} color="#E67E22" />
                                </View>
                                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider">Avg Stress</Text>
                            </View>
                        </View>
                    </View>

                    {/* Interactive Tracking Sliders - Only show if not logged */}
                    {!isLoggedToday && (
                        <View className="mb-8">
                            <Text className="text-textPrimary text-xl font-bold mb-4">Quick Log</Text>
                            <CustomSlider
                                label="Mood Score"
                                value={selectedMood}
                                min={1}
                                max={10}
                                onValueChange={handleMoodSelect}
                                icon="happy"
                                color="bg-primary"
                            />
                            <CustomSlider
                                label="Sleep Tonight"
                                value={sleepHours}
                                min={0}
                                max={12}
                                onValueChange={handleSleepChange}
                                icon="moon"
                                color="bg-accent"
                                unit="h"
                            />
                            <CustomSlider
                                label="Stress Level"
                                value={stressLevel}
                                min={1}
                                max={10}
                                onValueChange={handleStressChange}
                                icon="thunderstorm"
                                color="bg-mood-stressed"
                            />

                            <TouchableOpacity
                                onPress={handleFinalSave}
                                disabled={isSaving}
                                className="bg-primary py-5 rounded-[24px] items-center flex-row justify-center shadow-soft mt-2"
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={20} color="white" />
                                        <Text className="text-white font-bold ml-2">Save Today's Progress</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Early Support Mode Card (Compact) */}
                    {wellbeingScore >= 40 && wellbeingScore < 70 && (
                        <View className="mb-4 bg-amber-50/50 p-6 rounded-[32px] border border-amber-100 flex-row items-center justify-between shadow-sm overflow-hidden relative">
                            <TouchableOpacity
                                onPress={() => router.push("/wellness")}
                                activeOpacity={0.7}
                                className="flex-row items-center flex-1 z-10"
                            >
                                <View className="w-12 h-12 rounded-2xl bg-amber-500 items-center justify-center mr-4 shadow-soft">
                                    <Ionicons name="sunny" size={24} color="white" />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-0.5">
                                        <View className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2" />
                                        <Text className="text-amber-600 font-bold text-[10px] uppercase tracking-wider">Early Support Mode</Text>
                                    </View>
                                    <Text className="text-textPrimary font-bold text-sm">Small adjustments can make a big difference.</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push("/wellness/early-support")}
                                activeOpacity={0.8}
                                className="bg-amber-500 px-4 py-2.5 rounded-2xl shadow-soft z-10 ml-2"
                            >
                                <Text className="text-white font-bold text-xs">Today's Step</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Preventive Care Card (Compact) */}
                    {wellbeingScore >= 70 && (
                        <View className="mb-8 bg-green-50/50 p-6 rounded-[32px] border border-green-100 flex-row items-center justify-between shadow-sm overflow-hidden relative">
                            <TouchableOpacity
                                onPress={() => router.push("/wellness")}
                                activeOpacity={0.7}
                                className="flex-row items-center flex-1 z-10"
                            >
                                <View className="w-12 h-12 rounded-2xl bg-green-500 items-center justify-center mr-4 shadow-soft">
                                    <Ionicons name="leaf" size={24} color="white" />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-0.5">
                                        <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                                        <Text className="text-green-600 font-bold text-[10px] uppercase tracking-wider">Maintaining Balance</Text>
                                    </View>
                                    <Text className="text-textPrimary font-bold text-sm">Keep reinforcing what's working.</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push("/wellness/breathing")}
                                activeOpacity={0.8}
                                className="bg-green-500 px-4 py-2.5 rounded-2xl shadow-soft z-10 ml-2"
                            >
                                <Text className="text-white font-bold text-xs">Quick Reset</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Crisis Support Card (Compact) */}
                    {(wellbeingScore < 40 || riskLevel === 'critical') && (
                        <View className="mb-8 bg-red-50/50 p-6 rounded-[32px] border border-red-100 flex-row items-center justify-between shadow-sm overflow-hidden relative">
                            <TouchableOpacity
                                onPress={() => router.push("/wellness/therapy-scheduler")}
                                activeOpacity={0.7}
                                className="flex-row items-center flex-1 z-10"
                            >
                                <View className="w-12 h-12 rounded-2xl bg-red-500 items-center justify-center mr-4 shadow-soft">
                                    <Ionicons name="alert-circle" size={24} color="white" />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-0.5">
                                        <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                                        <Text className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Priority Support</Text>
                                    </View>
                                    <Text className="text-textPrimary font-bold text-sm">You are not alone. Help is here.</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push("/wellness/therapy-scheduler")}
                                activeOpacity={0.8}
                                className="bg-red-500 px-4 py-2.5 rounded-2xl shadow-soft z-10 ml-2"
                            >
                                <Text className="text-white font-bold text-xs">Support</Text>
                            </TouchableOpacity>
                        </View>
                    )}

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
                            <QuickAction icon="mic" title="Talk to AI" onPress={() => router.push('/chat')} color="bg-primary" />
                            <QuickAction icon="settings" title="Profile" onPress={() => router.push('/home/profile')} color="bg-textSecondary" />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
