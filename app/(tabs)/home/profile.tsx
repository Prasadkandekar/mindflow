import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const router = useRouter();

    const MenuItem = ({ icon, title, color = "text-gray-700" }: { icon: any, title: string, color?: string }) => (
        <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-4">
                    <Ionicons name={icon} size={20} color="#4b5563" />
                </View>
                <Text className={`text-base font-medium ${color}`}>{title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 pt-4 pb-2 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">Profile</Text>
            </View>

            <ScrollView className="px-6">
                <View className="items-center py-8">
                    <View className="w-24 h-24 rounded-full bg-emerald-100 items-center justify-center mb-4">
                        <Ionicons name="person" size={48} color="#10b981" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">Pravin Rathod</Text>
                    <Text className="text-gray-500">Employee ID: EMP-2024-089</Text>
                    <Text className="text-gray-500 mt-1">Age: 26</Text>
                </View>

                <View className="mt-4">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Account</Text>
                    <MenuItem icon="settings-outline" title="Settings" />
                    <MenuItem icon="lock-closed-outline" title="Privacy & Security" />
                    <MenuItem icon="notifications-outline" title="Notifications" />
                </View>

                <View className="mt-8">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Support</Text>
                    <MenuItem icon="help-circle-outline" title="Help Center" />
                    <MenuItem icon="information-circle-outline" title="About MoonDiary" />
                </View>

                <TouchableOpacity className="mt-12 mb-8 flex-row items-center justify-center bg-rose-50 p-4 rounded-2xl">
                    <Ionicons name="log-out-outline" size={20} color="#e11d48" />
                    <Text className="text-rose-600 font-bold ml-2 text-base">Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
