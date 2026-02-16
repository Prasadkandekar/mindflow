import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeDashboard() {
    const router = useRouter();

    const QuickAction = ({ icon, title, onPress, color }: { icon: any, title: string, onPress: () => void, color: string }) => (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white p-4 rounded-3xl shadow-sm items-center justify-center flex-1 mx-1"
            style={{ elevation: 2 }}
        >
            <View className={`${color} p-3 rounded-2xl mb-2`}>
                <Ionicons name={icon} size={24} color="white" />
            </View>
            <Text className="text-gray-700 font-medium text-xs text-center">{title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false} className="px-6">
                <View className="py-8">
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-gray-400 text-lg font-medium">Hello, Pravin</Text>
                            <Text className="text-gray-900 text-3xl font-bold">MoonDiary 🌙</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/home/profile')}>
                            <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center">
                                <Ionicons name="person" size={24} color="#10b981" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Wellbeing Score Card */}
                    <LinearGradient
                        colors={['#10b981', '#34d399']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-6 rounded-[40px] mb-8"
                    >
                        <Text className="text-white opacity-80 text-base font-medium">Wellbeing Score</Text>
                        <View className="flex-row items-end mt-2">
                            <Text className="text-white text-6xl font-bold">84</Text>
                            <Text className="text-white opacity-80 text-2xl mb-2 ml-1">/100</Text>
                        </View>
                        <Text className="text-white mt-4 font-medium">You're doing great today! ✨</Text>
                    </LinearGradient>

                    {/* Daily Summary */}
                    <View className="mb-8">
                        <Text className="text-gray-900 text-xl font-bold mb-4">Daily Summary</Text>
                        <View className="flex-row space-x-4">
                            <View className="bg-blue-50 p-6 rounded-[30px] flex-1">
                                <Ionicons name="moon" size={24} color="#3b82f6" />
                                <Text className="text-gray-900 text-2xl font-bold mt-2">7.5h</Text>
                                <Text className="text-gray-500 text-xs">Sleep Quality</Text>
                            </View>
                            <View className="bg-orange-50 p-6 rounded-[30px] flex-1">
                                <Ionicons name="flame" size={24} color="#f97316" />
                                <Text className="text-gray-900 text-2xl font-bold mt-2">5 Days</Text>
                                <Text className="text-gray-500 text-xs">Streak</Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View className="mb-8">
                        <Text className="text-gray-900 text-xl font-bold mb-4">Quick Actions</Text>
                        <View className="flex-row mb-4">
                            <QuickAction icon="add" title="New Journal" onPress={() => router.push('/home/add-journal')} color="bg-emerald-500" />
                            <QuickAction icon="stats-chart" title="Snapshot" onPress={() => router.push('/home/tracking')} color="bg-indigo-500" />
                            <QuickAction icon="clipboard" title="Assessments" onPress={() => router.push('/home/questionnaires')} color="bg-purple-500" />
                        </View>
                        <View className="flex-row">
                            <QuickAction icon="leaf" title="Wellness" onPress={() => router.push('/home/wellness-preview')} color="bg-rose-500" />
                            <QuickAction icon="mic" title="Talk to AI" onPress={() => router.push('/companion')} color="bg-amber-500" />
                            <QuickAction icon="settings" title="Profile Settings" onPress={() => router.push('/home/profile')} color="bg-gray-500" />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
