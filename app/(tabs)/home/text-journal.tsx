import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { JigsawStack } from "jigsawstack";
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../services/supabase';

const jigsaw = JigsawStack({
    apiKey: process.env.SENTIMENT_ANALYSIS_KEY || "sk_81f8495c21e2a0c28fcfbb5c4d8b3536241de5ad8f042f6f4f4a4f650422a80daafd965c9a2717649b29564f2bb8f836214f7d9419c0b88122e5b4548c306c7a024WJ2MS7CXPQfsxaTmCt"
});

const ACTOR_ID = '6ceaaeea-91f5-427d-bb4e-d651e2a2fd61';

export default function TextJournalScreen() {
    const router = useRouter();
    const [text, setText] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveJournal = async () => {
        if (!text.trim()) {
            Alert.alert("Empty Journal", "Please write something before saving.");
            return;
        }

        setIsSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            // 1. Upsert journal to Supabase (updates if entry exists for today)
            const { data: journalData, error: journalError } = await supabase
                .from('journals')
                .upsert(
                    [
                        {
                            user_id: ACTOR_ID,
                            content: text,
                            entry_date: today,
                        }
                    ],
                    { onConflict: 'user_id,entry_date' }
                )
                .select()
                .single();

            if (journalError) throw journalError;

            // 2. Perform sentiment analysis with JigsawStack
            try {
                const response = await jigsaw.sentiment({
                    text: text
                });

                if (response.success && response.sentiment) {
                    // 3. Save sentiment analysis to Supabase
                    // Note: Using insert instead of upsert because journal_id might not have a unique constraint
                    const { error: analysisError } = await supabase
                        .from('sentiment_analysis')
                        .insert([
                            {
                                journal_id: journalData.id,
                                sentiment_text: response.sentiment.sentiment,
                                sentiment_score: response.sentiment.score || 0,
                                emotion_label: response.sentiment.emotion || 'neutral'
                            }
                        ]);

                    if (analysisError) {
                        console.error('Error saving sentiment analysis:', analysisError);
                    }
                }
            } catch (jigsawError) {
                console.error('JigsawStack analysis failed:', jigsawError);
            }

            Alert.alert("Success", "Your journal has been saved and analyzed.");
            router.back();
        } catch (error: any) {
            console.error('Error saving journal:', error);
            Alert.alert("Error", error.message || "Failed to save journal.");
        } finally {
            setIsSaving(false);
        }
    };

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
                        <TouchableOpacity
                            className="flex-1 bg-white border border-secondary/20 py-5 rounded-[24px] items-center flex-row justify-center shadow-card"
                            onPress={handleSaveJournal}
                            disabled={isSaving}
                        >
                            <Ionicons name="sparkles" size={18} color="#FF7B1B" />
                            <Text className="text-textPrimary font-bold ml-2">Analyze</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-2 bg-primary py-5 rounded-[24px] items-center flex-row justify-center shadow-soft"
                            onPress={handleSaveJournal}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="white" />
                                    <Text className="text-white font-bold ml-2">Save Journal</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
                <View className='p-7' />
            </KeyboardAvoidingView>
        </SafeAreaView>


    );
}
