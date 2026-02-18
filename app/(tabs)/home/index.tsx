import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
                                    <Text className="text-white text-xs font-medium">Hello, Pravin! 👋</Text>
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
                        {['happy', 'sad', 'heart', 'sunny'].map((mood, idx) => (
                            <TouchableOpacity key={idx} className="w-14 h-14 rounded-full bg-white/30 border border-white/40 items-center justify-center">
                                <Ionicons name={mood === 'sunny' ? 'sunny' : (mood as any)} size={28} color="white" />
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
                                    <Text className="text-primary text-4xl font-bold">84</Text>
                                    <Text className="text-textSecondary text-lg font-medium ml-1">/100</Text>
                                </View>
                            </View>
                            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
                                <Ionicons name="sparkles" size={32} color="#FF7B1B" />
                            </View>
                        </View>
                        <View className="h-2 bg-background rounded-full mt-4 overflow-hidden">
                            <View className="h-full bg-primary w-[84%] rounded-full" />
                        </View>
                        <Text className="text-textPrimary mt-4 font-semibold text-sm">You're doing great today! ✨</Text>
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
                                <Text className="text-textPrimary text-xl font-bold">7.5h</Text>
                                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider">Sleep Quality</Text>
                            </View>
                            <View className="bg-mood-neutral/20 p-5 rounded-[32px] flex-1 border border-mood-neutral/30">
                                <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center mb-3">
                                    <Ionicons name="flame" size={20} color="#FF7B1B" />
                                </View>
                                <Text className="text-textPrimary text-xl font-bold">5 Days</Text>
                                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider">Current Streak</Text>
                            </View>
                        </View>
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
