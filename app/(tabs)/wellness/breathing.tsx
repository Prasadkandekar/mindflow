import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BreathingExercisesScreen() {
    const router = useRouter();
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
    const [secondsInPhase, setSecondsInPhase] = useState(4);

    const scaleValue = useRef(new Animated.Value(1)).current;
    const opacityValue = useRef(new Animated.Value(1)).current;

    const startBreathing = () => {
        setIsActive(true);
        setTimeLeft(180);
        runBreathingCycle();
    };

    const runBreathingCycle = () => {
        // Box Breathing: 4 Inhale, 4 Hold, 4 Exhale, 4 Pause
        const cycle = async () => {
            // Inhale
            setPhase('Inhale');
            setSecondsInPhase(4);
            Animated.timing(scaleValue, {
                toValue: 1.5,
                duration: 4000,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start();
            await sleep(4000);

            // Hold
            setPhase('Hold');
            setSecondsInPhase(4);
            await sleep(4000);

            // Exhale
            setPhase('Exhale');
            setSecondsInPhase(4);
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 4000,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start();
            await sleep(4000);

            // Pause
            setPhase('Pause');
            setSecondsInPhase(4);
            await sleep(4000);

            if (isActive) runBreathingCycle();
        };
        cycle();
    };

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
                setSecondsInPhase(prev => {
                    if (prev > 1) return prev - 1;
                    return 4;
                });
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    useEffect(() => {
        if (isActive) {
            runBreathingCycle();
        }
    }, [isActive]);

    const ExerciseItem = ({ title, duration, type, onPress }: { title: string, duration: string, type: string, onPress?: () => void }) => (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white p-6 rounded-[28px] mb-4 flex-row items-center justify-between border border-gray-100 shadow-sm"
        >
            <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center mr-4">
                    <Ionicons name="water" size={24} color="#3b82f6" />
                </View>
                <View>
                    <Text className="text-gray-900 font-bold text-lg">{title}</Text>
                    <View className="flex-row items-center">
                        <Text className="text-gray-400 text-xs mr-2">{duration}</Text>
                        <View className="w-1 h-1 rounded-full bg-gray-300 mr-2" />
                        <Text className="text-blue-500 text-xs font-bold uppercase">{type}</Text>
                    </View>
                </View>
            </View>
            <View className="bg-blue-500 w-10 h-10 rounded-full items-center justify-center">
                <Ionicons name="play" size={20} color="white" />
            </View>
        </TouchableOpacity>
    );

    if (isActive) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="px-6 pt-4 flex-row items-center border-b border-gray-50">
                    <TouchableOpacity onPress={() => setIsActive(false)}>
                        <Ionicons name="close" size={28} color="black" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold ml-4">Box Breathing</Text>
                </View>

                {timeLeft > 0 ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <View className="items-center mb-12">
                            <Text className="text-blue-500 font-bold text-4xl mb-2 uppercase tracking-widest">{phase}</Text>
                            <Text className="text-gray-400 text-lg font-medium">Remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
                        </View>

                        <Animated.View
                            style={{
                                transform: [{ scale: scaleValue }],
                            }}
                            className="w-48 h-48 rounded-full bg-blue-500 items-center justify-center shadow-2xl shadow-blue-500/50"
                        >
                            <View className="w-40 h-40 rounded-full bg-blue-400/30 items-center justify-center">
                                <Ionicons name="infinite" size={64} color="white" />
                            </View>
                        </Animated.View>

                        <View className="mt-20 items-center">
                            <View className="flex-row gap-2 mb-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <View
                                        key={i}
                                        className={`w-3 h-3 rounded-full ${i <= (4 - secondsInPhase + 1) ? 'bg-blue-500' : 'bg-gray-200'}`}
                                    />
                                ))}
                            </View>
                            <Text className="text-gray-500 text-center text-lg italic">
                                {phase === 'Inhale' && 'Slowly fill your lungs with air...'}
                                {phase === 'Hold' && 'Gently hold that breath...'}
                                {phase === 'Exhale' && 'Let the air out through your mouth...'}
                                {phase === 'Pause' && 'Rest before the next cycle...'}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View className="flex-1 items-center justify-center px-6">
                        <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
                            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
                        </View>
                        <Text className="text-3xl font-bold text-gray-900 mb-2">Session Complete!</Text>
                        <Text className="text-gray-500 text-center text-lg mb-10">You've successfully completed your 3-minute calm session. Take this feeling with you into your day.</Text>
                        <TouchableOpacity
                            onPress={() => setIsActive(false)}
                            className="bg-blue-600 px-12 py-5 rounded-[24px] shadow-lg shadow-blue-200"
                        >
                            <Text className="text-white font-bold text-lg">Finish</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {timeLeft > 0 && (
                    <TouchableOpacity
                        onPress={() => setIsActive(false)}
                        className="m-10 bg-gray-100 py-5 rounded-[24px] items-center"
                    >
                        <Text className="text-gray-600 font-bold text-lg">Stop Session</Text>
                    </TouchableOpacity>
                )}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 pt-4 pb-2 flex-row items-center bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">Breathing Exercises 🫁</Text>
            </View>

            <ScrollView className="p-6">
                <View className="mb-8 p-8 bg-blue-600 rounded-[40px] items-center shadow-lg shadow-blue-200">
                    <Ionicons name="infinite" size={48} color="white" className="mb-4" />
                    <Text className="text-white text-2xl font-bold mb-2">3-min Calm</Text>
                    <Text className="text-blue-100 text-center mb-6">A quick session to regulate your heart rate and settle your mind.</Text>
                    <TouchableOpacity
                        onPress={startBreathing}
                        className="bg-white px-10 py-4 rounded-3xl active:bg-blue-50"
                    >
                        <Text className="text-blue-600 font-bold text-lg">Start Session</Text>
                    </TouchableOpacity>
                </View>

                <Text className="text-gray-900 text-xl font-bold mb-4">All Exercises</Text>
                <ExerciseItem onPress={startBreathing} title="Box Breathing" duration="4 mins" type="Focus" />
                <ExerciseItem onPress={startBreathing} title="Stress Relief" duration="5 mins" type="Calm" />
                <ExerciseItem onPress={startBreathing} title="Deep Sleep Preparation" duration="10 mins" type="Sleep" />
                <ExerciseItem onPress={startBreathing} title="Morning Energy" duration="3 mins" type="Vitality" />
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
