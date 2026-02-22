import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';

const ACTOR_ID = '6ceaaeea-91f5-427d-bb4e-d651e2a2fd61';

interface Therapist {
    id: string | number;
    name: string;
    specialization: string;
    email: string;
}

export default function TherapySchedulerScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [booking, setBooking] = useState<string | number | null>(null);

    useEffect(() => {
        fetchTherapists();
    }, []);

    async function fetchTherapists() {
        try {
            const { data, error } = await supabase
                .from('therapists')
                .select('*')
                .order('name');

            if (error) throw error;
            setTherapists(data || []);
        } catch (error) {
            console.error('Error fetching therapists:', error);
            Alert.alert('Error', 'Failed to load therapists. Please try again later.');
        } finally {
            setLoading(false);
        }
    }

    async function handleBookSession(therapist: Therapist) {
        setBooking(therapist.id);
        try {
            // 1. Create a session record
            const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .insert([{
                    title: `Therapy Session with ${therapist.name}`,
                    description: `Crisis support session requested by user.`,
                    session_type: 'INDIVIDUAL',
                    scheduled_at: new Date(Date.now() + 86400000).toISOString(), // Suggest tomorrow
                    status: 'SCHEDULED'
                }])
                .select()
                .single();

            if (sessionError) throw sessionError;

            // 2. Create the assignment
            const { error: assignmentError } = await supabase
                .from('therapist_assignments')
                .insert([{
                    session_id: sessionData.id,
                    therapist_id: therapist.id,
                    employee_id: ACTOR_ID
                }]);

            if (assignmentError) throw assignmentError;

            Alert.alert(
                "Appointment Requested",
                `Your crisis support session with ${therapist.name} has been scheduled for tomorrow. We will contact you with the exact time.`,
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error booking session:', error);
            Alert.alert('Booking Failed', 'Unable to schedule the session. Please call our hotline for immediate support.');
        } finally {
            setBooking(null);
        }
    }

    return (
        <View className="flex-1 bg-[#FFF9F5]">
            <LinearGradient
                colors={['#EF4444', '#F87171']}
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
                <Text className="text-white text-3xl font-bold leading-tight">Professional Support</Text>
                <Text className="text-white/80 mt-2 font-medium">Connect with a specialized therapist today.</Text>
            </LinearGradient>

            <ScrollView className="flex-1 px-6 pt-8" contentContainerStyle={{ paddingBottom: 60 }}>
                <View className="mb-8">
                    <Text className="text-textSecondary font-bold text-xs uppercase tracking-widest mb-1">Available Specialists</Text>
                    <Text className="text-2xl font-bold text-textPrimary">Help is a step away.</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#EF4444" className="mt-10" />
                ) : therapists.length === 0 ? (
                    <View className="bg-white p-8 rounded-[32px] items-center border border-gray-100">
                        <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                        <Text className="text-textSecondary mt-4 text-center">No therapists are currently available online. Please use our emergency hotline.</Text>
                    </View>
                ) : (
                    therapists.map((therapist) => (
                        <View key={therapist.id} className="bg-white p-6 rounded-[32px] mb-4 shadow-sm border border-red-50">
                            <View className="flex-row items-center mb-4">
                                <View className="w-14 h-14 rounded-2xl bg-red-100 items-center justify-center mr-4">
                                    <Ionicons name="person" size={28} color="#EF4444" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-textPrimary font-bold text-lg">{therapist.name}</Text>
                                    <Text className="text-textSecondary text-sm">{therapist.specialization}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => handleBookSession(therapist)}
                                disabled={booking !== null}
                                className="bg-red-500 py-4 rounded-2xl items-center shadow-soft"
                            >
                                {booking === therapist.id ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold">Request Priority Session</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ))
                )}

                <TouchableOpacity
                    className="mt-6 bg-white p-6 rounded-[32px] border border-red-200 flex-row items-center justify-center"
                    onPress={() => Alert.alert("Emergency Hotline", "Connecting to 24/7 Crisis Support Line...")}
                >
                    <Ionicons name="call" size={24} color="#EF4444" className="mr-3" />
                    <Text className="text-red-500 font-bold text-lg">Call Crisis Hotline Now</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
