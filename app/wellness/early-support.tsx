import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EarlySupportPlanScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [worryText, setWorryText] = useState('');
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [worryTimerActive, setWorryTimerActive] = useState(false);
    const [worryTimeLeft, setWorryTimeLeft] = useState(1200); // 20 minutes

    useEffect(() => {
        let interval: any;
        if (worryTimerActive && worryTimeLeft > 0) {
            interval = setInterval(() => {
                setWorryTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (worryTimeLeft === 0) {
            setWorryTimerActive(false);
            toggleStepCompletion(2);
        }
        return () => clearInterval(interval);
    }, [worryTimerActive, worryTimeLeft]);

    const toggleStepCompletion = (stepId: number) => {
        setCompletedSteps(prev =>
            prev.includes(stepId) ? prev.filter(id => id !== stepId) : [...prev, stepId]
        );
    };

    const startWorryTimer = () => {
        if (!worryText.trim()) return;
        setWorryTimeLeft(1200);
        setWorryTimerActive(true);
    };

    const throwInTrash = () => {
        if (!worryText.trim()) return;
        setWorryText('');
        setWorryTimerActive(false);
        toggleStepCompletion(2);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const SectionHeader = ({ id, title, icon, color }: { id: number, title: string, icon: any, color: string }) => (
        <View className="flex-row items-center mb-4">
            <View className={`w-10 h-10 rounded-2xl ${color} items-center justify-center mr-4 shadow-soft`}>
                <Ionicons name={icon} size={20} color="white" />
            </View>
            <View className="flex-1">
                <Text className="text-textPrimary font-bold text-lg">{title}</Text>
            </View>
            {completedSteps.includes(id) && (
                <View className="bg-green-100 p-1 rounded-full">
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                </View>
            )}
        </View>
    );

    return (
        <View className="flex-1 bg-[#FFF9F5]">
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#FF7B1B', '#FFAB73']}
                style={{
                    paddingTop: insets.top + 20,
                    paddingBottom: 30,
                    paddingHorizontal: 24,
                    borderBottomLeftRadius: 40,
                    borderBottomRightRadius: 40
                }}
            >
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-6">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-3xl font-bold leading-tight">Your 14-Day Reset</Text>
                <Text className="text-white/80 mt-2 font-medium">Gentle tools to help you course-correct.</Text>
            </LinearGradient>

            <ScrollView
                className="flex-1 px-6 pt-8"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                <View className="mb-8">
                    <Text className="text-textSecondary font-bold text-xs uppercase tracking-widest mb-1">Today's Focus</Text>
                    <Text className="text-3xl font-bold text-textPrimary">Gentle Course Correction</Text>
                    <Text className="text-textSecondary mt-2 leading-relaxed">
                        These small steps are designed to interrupt stress patterns and build momentum.
                    </Text>
                </View>

                {/* 1. Behavioral Activation */}
                <View className="bg-white p-6 rounded-[32px] mb-6 shadow-sm border border-amber-100">
                    <SectionHeader id={1} title="Behavioral Activation" icon="color-palette" color="bg-amber-500" />
                    <Text className="text-textSecondary text-sm mb-4">
                        Schedule 5-10 minutes today for painting or a creative activity. It helps activate the "enjoyment" centers of your brain.
                    </Text>
                    <TouchableOpacity
                        onPress={() => toggleStepCompletion(1)}
                        className={`py-3 rounded-2xl items-center ${completedSteps.includes(1) ? 'bg-green-100' : 'bg-amber-50'}`}
                    >
                        <Text className={completedSteps.includes(1) ? 'text-green-600 font-bold' : 'text-amber-600 font-bold'}>
                            {completedSteps.includes(1) ? 'Scheduled for Today' : 'Schedule for Today'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 2. Worry Timer Scheduler */}
                <View className="bg-white p-6 rounded-[32px] mb-6 shadow-sm border border-amber-100">
                    <SectionHeader id={2} title="Worry Container" icon="timer" color="bg-amber-500" />
                    <Text className="text-textSecondary text-sm mb-4">
                        Capture a worry that's lingering. Either let it go now or contain it to a specific time.
                    </Text>

                    {!worryTimerActive && worryTimeLeft > 0 ? (
                        <>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-2xl mb-4 text-textPrimary h-24"
                                placeholder="What's on your mind?"
                                multiline
                                textAlignVertical="top"
                                value={worryText}
                                onChangeText={setWorryText}
                            />
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={throwInTrash}
                                    className="flex-1 bg-gray-100 py-3 rounded-2xl items-center"
                                >
                                    <Text className="text-textPrimary font-bold">Trash It</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={startWorryTimer}
                                    className="flex-1 bg-amber-500 py-3 rounded-2xl items-center shadow-soft"
                                >
                                    <Text className="text-white font-bold">20-Min Timer</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View className="items-center py-4">
                            <View className="w-32 h-32 rounded-full border-4 border-amber-500 items-center justify-center mb-4">
                                <Text className="text-3xl font-bold text-amber-600">
                                    {worryTimeLeft === 0 ? "0:00" : formatTime(worryTimeLeft)}
                                </Text>
                            </View>
                            <Text className="text-textPrimary font-bold text-lg mb-1">
                                {worryTimeLeft === 0 ? "ok stop worrying now" : "Focus on your thoughts..."}
                            </Text>
                            <Text className="text-textSecondary text-sm text-center px-4">
                                {worryTimeLeft === 0
                                    ? "Session complete. You've contained your overthinking."
                                    : "you are allowed to overthink for 20 minutes"}
                            </Text>
                            {worryTimeLeft > 0 && (
                                <TouchableOpacity
                                    onPress={() => setWorryTimerActive(false)}
                                    className="mt-6 px-6 py-2 bg-gray-100 rounded-full"
                                >
                                    <Text className="text-textSecondary font-bold">Pause</Text>
                                </TouchableOpacity>
                            )}
                            {worryTimeLeft === 0 && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setWorryTimeLeft(1200);
                                        setWorryText('');
                                    }}
                                    className="mt-6 px-6 py-2 bg-green-500 rounded-full"
                                >
                                    <Text className="text-white font-bold">Reset</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                {/* 3. Box Breathing Session */}
                <View className="bg-white p-6 rounded-[32px] mb-6 shadow-sm border border-blue-100">
                    <SectionHeader id={3} title="Box Breathing Reset" icon="water" color="bg-blue-500" />
                    <Text className="text-textSecondary text-sm mb-4">
                        Regulate your nervous system with a simple 4-count breathing technique.
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            toggleStepCompletion(3);
                            router.push("/wellness/breathing");
                        }}
                        className="bg-blue-500 py-4 rounded-3xl items-center shadow-soft"
                    >
                        <Text className="text-white font-bold">Start Breathing</Text>
                    </TouchableOpacity>
                </View>

                {/* 4. Physical Movement */}
                <View className="bg-white p-6 rounded-[32px] mb-6 shadow-sm border border-mood-calm/50">
                    <SectionHeader id={4} title="6-Min Movement" icon="fitness" color="bg-mood-calm" />
                    <Text className="text-textSecondary text-sm mb-4">
                        Small physical shifts can break mental loops. Try 6 minutes of your favorite movement.
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            toggleStepCompletion(4);
                            router.push("/wellness/exercises");
                        }}
                        className="border border-mood-calm/30 bg-mood-calm/5 py-4 rounded-3xl items-center"
                    >
                        <Text className="text-mood-calm font-bold">Mind-Body Section</Text>
                    </TouchableOpacity>
                </View>

                {/* 5. Relaxation Hub */}
                <View className="bg-white p-6 rounded-[32px] mb-6 shadow-sm border border-accent/20">
                    <SectionHeader id={6} title="Relaxation Hub" icon="musical-notes" color="bg-accent" />
                    <Text className="text-textSecondary text-sm mb-4 leading-relaxed font-medium">
                        Complete your 14-day reset by immersing yourself in calming soundscapes.
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            toggleStepCompletion(6);
                            router.push("/wellness/sounds");
                        }}
                        className="bg-accent py-4 rounded-3xl items-center shadow-soft"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="play-circle" size={20} color="white" />
                            <Text className="text-white font-bold ml-2 text-lg">Open Soundscapes</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* 6. Small Wins Indicator */}
                <View className="bg-green-50/50 p-5 rounded-[32px] mb-8 border border-green-100">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-green-800 font-bold">Daily Completion</Text>
                        <View className="bg-green-200 px-3 py-1 rounded-full">
                            <Text className="text-green-800 text-[10px] font-bold">{completedSteps.length} / 5 COMPLETE</Text>
                        </View>
                    </View>
                    <View className="h-2.5 bg-green-100 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${(completedSteps.length / 5) * 100}%` }}
                        />
                    </View>
                    <Text className="text-green-700 text-xs mt-3 font-medium italic">
                        {completedSteps.length === 5
                            ? "Incredible! You've completed your reset for today. 🌟"
                            : "Every small victory builds your resilience."}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
