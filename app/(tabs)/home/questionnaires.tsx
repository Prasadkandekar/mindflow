import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function QuestionnairesScreen() {
    const router = useRouter();

    const AssessmentItem = ({ title, status, duration }: { title: string, status: 'checked' | 'available', duration: string }) => (
        <TouchableOpacity className="bg-white p-5 rounded-[28px] mb-4 flex-row items-center justify-between border border-gray-100">
            <View className="flex-row items-center flex-1">
                <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${status === 'checked' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                    <Ionicons
                        name={status === 'checked' ? "checkmark-circle" : "clipboard"}
                        size={24}
                        color={status === 'checked' ? "#10b981" : "#3b82f6"}
                    />
                </View>
                <View>
                    <Text className="text-gray-900 font-bold text-base">{title}</Text>
                    <Text className="text-gray-400 text-xs">{duration}</Text>
                </View>
            </View>
            {status === 'checked' ? (
                <Text className="text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full uppercase">Completed</Text>
            ) : (
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 pt-4 pb-2 flex-row items-center bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">Mental Health Check 🧠</Text>
            </View>

            <ScrollView className="p-6">
                <Text className="text-gray-500 font-medium mb-6">Regular check-ins help tracking your mental wellbeing trends over time.</Text>

                <View>
                    <Text className="text-gray-900 text-lg font-bold mb-4">Available Assessments</Text>
                    <AssessmentItem title="Stress Scale (PSS)" status="checked" duration="5 mins" />
                    <AssessmentItem title="Anxiety Scale (GAD-7)" status="checked" duration="4 mins" />
                    <AssessmentItem title="Burnout Check" status="available" duration="6 mins" />
                    <AssessmentItem title="Depression Index (PHQ-9)" status="available" duration="5 mins" />
                </View>

                <TouchableOpacity
                    className="mt-8 bg-blue-600 p-5 rounded-[24px] items-center shadow-lg shadow-blue-200"
                    onPress={() => { }}
                >
                    <Text className="text-white font-bold text-lg">Start New Assessment</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
