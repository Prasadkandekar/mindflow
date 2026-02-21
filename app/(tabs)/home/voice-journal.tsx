import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { JigsawStack } from "jigsawstack";
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../services/supabase';

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API || "04845e4eb75a8924f4d888ccfc1ed356488d4440";
const jigsaw = JigsawStack({
    apiKey: process.env.SENTIMENT_ANALYSIS_KEY || "sk_81f8495c21e2a0c28fcfbb5c4d8b3536241de5ad8f042f6f4f4a4f650422a80daafd965c9a2717649b29564f2bb8f836214f7d9419c0b88122e5b4548c306c7a024WJ2MS7CXPQfsxaTmCt"
});

const ACTOR_ID = '6ceaaeea-91f5-427d-bb4e-d651e2a2fd61';

export default function VoiceJournalScreen() {
    const router = useRouter();
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [duration, setDuration] = useState(0);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (recording) {
                recording.stopAndUnloadAsync();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert("Permission Required", "Please allow microphone access to record your journal.");
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
            setIsRecording(true);
            setDuration(0);
            setTranscript('');

            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert("Error", "Could not start recording. Please try again.");
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        try {
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);

            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            if (uri) {
                handleTranscription(uri);
            }
        } catch (err) {
            console.error('Failed to stop recording', err);
        }
    };

    const handleTranscription = async (uri: string) => {
        if (duration < 1) {
            Alert.alert("Recording Too Short", "Please speak for at least a few seconds.");
            setIsTranscribing(false);
            return;
        }

        setIsTranscribing(true);
        console.log('Starting transcription for URI:', uri);

        try {
            // Fix for Android path encoding issues:
            // Fetch the local file as a blob first - this is more reliable than FormData
            const responseLocal = await fetch(uri);
            const blob = await responseLocal.blob();

            const response = await fetch(
                'https://api.deepgram.com/v1/listen?smart_format=true&model=nova-2&punctuate=true',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
                        'Content-Type': 'audio/mp4', // .m4a is essentially mp4 audio
                    },
                    body: blob,
                }
            );

            const data = await response.json();
            console.log('Deepgram Response:', JSON.stringify(data, null, 2));

            if (!response.ok) {
                throw new Error(data.message || data.err_msg || `Deepgram error: ${response.status}`);
            }

            const text = data.results?.channels[0]?.alternatives[0]?.transcript;

            if (text && text.trim().length > 0) {
                setTranscript(text);
            } else {
                Alert.alert("Empty Transcription", "Deepgram couldn't find any speech. Try speaking louder or closer to the mic.");
            }
        } catch (error: any) {
            console.error('Transcription error', error);
            Alert.alert("Error", `Transcription failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleSaveJournal = async () => {
        if (!transcript.trim()) {
            Alert.alert("Empty Transcript", "Please record something before saving.");
            return;
        }

        setIsSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            // 1. Insert journal to Supabase
            const { data: journalData, error: journalError } = await supabase
                .from('journals')
                .insert([
                    {
                        user_id: ACTOR_ID,
                        content: transcript,
                        entry_date: today,
                    }
                ])
                .select()
                .single();

            if (journalError) throw journalError;

            // 2. Perform sentiment analysis
            try {
                const response = await jigsaw.sentiment({ text: transcript });
                if (response.success && response.sentiment) {
                    await supabase.from('sentiment_analysis').insert([{
                        journal_id: journalData.id,
                        sentiment_text: response.sentiment.sentiment,
                        sentiment_score: response.sentiment.score || 0,
                        emotion_label: response.sentiment.emotion || 'neutral'
                    }]);
                }
            } catch (err) {
                console.error('Sentiment analysis failed:', err);
            }

            Alert.alert("Success", "Your voice reflection has been saved and analyzed! ✨");
            router.replace('/(tabs)/home');
        } catch (error: any) {
            console.error('Error saving journal:', error);
            Alert.alert("Error", error.message || "Failed to save journal.");
        } finally {
            setIsSaving(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-6 py-6 flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card"
                >
                    <Ionicons name="close" size={24} color="#2D1E17" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-textPrimary">Voice Reflection 🎙️</Text>
                <View className="w-10" />
            </View>

            <View className="flex-1 items-center justify-center px-10">
                {isRecording ? (
                    <View className="items-center">
                        <View className="w-56 h-56 rounded-full bg-primary/10 items-center justify-center mb-8">
                            <View className="w-48 h-48 rounded-full bg-primary/20 items-center justify-center">
                                <LinearGradient
                                    colors={['#FF7B1B', '#FFAB73']}
                                    className="w-36 h-36 rounded-full items-center justify-center shadow-soft"
                                >
                                    <View className="bg-white/20 w-16 h-16 rounded-full items-center justify-center">
                                        <View className="w-6 h-6 bg-white rounded-sm" />
                                    </View>
                                </LinearGradient>
                            </View>
                        </View>
                        <Text className="text-primary text-2xl font-bold mb-2">Recording...</Text>
                        <View className="bg-white px-4 py-1.5 rounded-full border border-secondary/20 shadow-card">
                            <Text className="text-textSecondary font-bold">{formatDuration(duration)}</Text>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={startRecording}
                        className="items-center"
                        disabled={isTranscribing}
                    >
                        <View className="w-48 h-48 rounded-full bg-white items-center justify-center shadow-card border border-secondary/10 mb-8">
                            <LinearGradient
                                colors={['#FF7B1B', '#FFAB73']}
                                className="w-36 h-36 rounded-full items-center justify-center shadow-soft"
                            >
                                <Ionicons name="mic" size={48} color="white" />
                            </LinearGradient>
                        </View>
                        <Text className="text-textPrimary text-2xl font-bold">
                            {isTranscribing ? "Transcribing..." : "Start Recording"}
                        </Text>
                        <Text className="text-textSecondary mt-2 font-medium">
                            {isTranscribing ? "Please wait a moment" : "Tap to share your thoughts"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <View className="h-[40%] bg-white rounded-t-[48px] px-8 pt-10 shadow-soft border-t border-secondary/10">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-textSecondary font-bold text-[10px] uppercase tracking-widest">
                        {isTranscribing ? "AI is listening..." : "Transcription"}
                    </Text>
                    {isTranscribing && <ActivityIndicator size="small" color="#FF7B1B" />}
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {transcript ? (
                        <Text className="text-textPrimary text-lg leading-relaxed font-medium">
                            {transcript}
                        </Text>
                    ) : (
                        <Text className="text-textSecondary/50 text-lg leading-relaxed font-medium italic">
                            {isRecording ? "Listening to your voice..." : "Your reflection will appear here..."}
                        </Text>
                    )}
                </ScrollView>

                {transcript !== '' && !isRecording && (
                    <View className="flex-row gap-4 mt-6 pb-10">
                        <TouchableOpacity
                            onPress={() => setTranscript('')}
                            className="flex-1 bg-background py-5 rounded-[24px] items-center border border-secondary/20 shadow-card"
                        >
                            <Text className="text-textPrimary font-bold">Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSaveJournal}
                            disabled={isSaving}
                            className="flex-[2] bg-primary py-5 rounded-[24px] items-center shadow-soft flex-row justify-center"
                        >
                            {isSaving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={18} color="white" className="mr-2" />
                                    <Text className="text-white font-bold ml-2">Save Reflection</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {isRecording && (
                    <View className="flex-row gap-4 mt-6 pb-10">
                        <TouchableOpacity
                            onPress={stopRecording}
                            className="flex-1 bg-primary py-5 rounded-[24px] items-center shadow-soft flex-row justify-center"
                        >
                            <Ionicons name="stop" size={18} color="white" className="mr-2" />
                            <Text className="text-white font-bold ml-2">Stop & Transcribe</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
