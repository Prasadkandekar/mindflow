import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TextJournalScreen() {
    const router = useRouter();
    const [text, setText] = useState('');

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="px-6 py-6 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
                            <Ionicons name="arrow-back" size={20} color="#2D1E17" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold ml-4 text-textPrimary">Your Story 📝</Text>
                    </View>
                    <TouchableOpacity className="bg-secondary/20 px-4 py-2 rounded-full border border-secondary/30">
                        <Text className="text-primary font-bold text-xs uppercase tracking-wider">Draft</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="px-6 flex-1 mt-4">
                    <TextInput
                        multiline
                        placeholder="What's on your heart today?"
                        placeholderTextColor="#8E7E77"
                        className="text-lg leading-relaxed text-textPrimary"
                        style={{ textAlignVertical: 'top', minHeight: 400 }}
                        value={text}
                        onChangeText={setText}
                        autoFocus
                    />
                </ScrollView>

                <View className="p-6">
                    <View className="flex-row gap-4">
                        <TouchableOpacity className="flex-1 bg-white border border-secondary/20 py-5 rounded-[24px] items-center flex-row justify-center shadow-card">
                            <Ionicons name="sparkles" size={18} color="#FF7B1B" />
                            <Text className="text-textPrimary font-bold ml-2">Analyze</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-2 bg-primary py-5 rounded-[24px] items-center flex-row justify-center shadow-soft"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="checkmark-circle" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Save Journal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
