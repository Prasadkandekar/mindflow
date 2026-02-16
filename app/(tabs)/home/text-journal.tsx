import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TextJournalScreen() {
    const router = useRouter();
    const [text, setText] = useState('');

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold ml-4">Write Your Thoughts 📝</Text>
                    </View>
                    <TouchableOpacity className="bg-emerald-50 px-4 py-2 rounded-full">
                        <Text className="text-emerald-600 font-bold">Draft</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="px-6 flex-1 mt-4">
                    <TextInput
                        multiline
                        placeholder="How are you feeling today?"
                        placeholderTextColor="#9ca3af"
                        className="text-lg leading-relaxed text-gray-800 h-full"
                        style={{ textAlignVertical: 'top', minHeight: 300 }}
                        value={text}
                        onChangeText={setText}
                        autoFocus
                    />
                </ScrollView>

                <View className="p-6 border-t border-gray-100 bg-gray-50">
                    <View className="flex-row space-x-4">
                        <TouchableOpacity className="flex-1 bg-white border border-emerald-500 py-4 rounded-2xl items-center flex-row justify-center">
                            <Ionicons name="analytics" size={20} color="#10b981" className="mr-2" />
                            <Text className="text-emerald-600 font-bold ml-2">Analyze Emotion</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 bg-emerald-500 py-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-emerald-200"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="save" size={20} color="white" className="mr-2" />
                            <Text className="text-white font-bold ml-2">Save Entry</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
