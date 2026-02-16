import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const JOURNAL_ENTRIES = [
  { id: '1', date: 'Feb 16', title: 'Productive Monday', rating: 4, mood: 'Positive', preview: 'Today I managed to finish all my tasks ahead of schedule...' },
  { id: '2', date: 'Feb 15', title: 'Late Night Thoughts', rating: 3, mood: 'Neutral', preview: 'Feeling a bit tired today, but generally okay. Need to sleep early...' },
  { id: '3', date: 'Feb 14', title: 'Amazing Valentine Dinner', rating: 5, mood: 'Positive', preview: 'The dinner was spectacular and the company was even better...' },
  { id: '4', date: 'Feb 13', title: 'Dealing with Stress', rating: 2, mood: 'Difficult', preview: 'A lot of pressure at work today, struggling to keep calm...' },
];

export default function JournalScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');

  const FilterButton = ({ label }: { label: string }) => (
    <TouchableOpacity
      onPress={() => setFilter(label)}
      className={`px-6 py-2 rounded-full mr-2 ${filter === label ? 'bg-emerald-500' : 'bg-white border border-gray-100'}`}
    >
      <Text className={`font-bold text-sm ${filter === label ? 'text-white' : 'text-gray-500'}`}>{label}</Text>
    </TouchableOpacity>
  );

  const EntryCard = ({ item }: { item: typeof JOURNAL_ENTRIES[0] }) => (
    <TouchableOpacity
      onPress={() => router.push('/journal/entry-detail')}
      className="bg-white p-5 rounded-[28px] mb-4 border border-gray-50 shadow-sm"
      style={{ elevation: 1 }}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">{item.date}</Text>
          <Text className="text-gray-900 font-bold text-lg">{item.title}</Text>
        </View>
        <View className="flex-row">
          {[...Array(5)].map((_, i) => (
            <Ionicons key={i} name="star" size={14} color={i < item.rating ? "#fbbf24" : "#e2e8f0"} />
          ))}
        </View>
      </View>
      <Text className="text-gray-500 text-sm leading-relaxed" numberOfLines={2}>{item.preview}</Text>
      <View className="mt-3 flex-row items-center">
        <View className={`px-3 py-1 rounded-full ${item.mood === 'Positive' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          <Text className={`text-[10px] font-bold uppercase ${item.mood === 'Positive' ? 'text-emerald-600' : 'text-rose-600'}`}>{item.mood}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-4 flex-row justify-between items-center bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold">Your Journal 📔</Text>
        <TouchableOpacity onPress={() => router.push('/home/add-journal')}>
          <Ionicons name="add-circle" size={32} color="#10b981" />
        </TouchableOpacity>
      </View>

      <View className="py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
          <FilterButton label="All" />
          <FilterButton label="Positive" />
          <FilterButton label="Difficult Days" />
        </ScrollView>
      </View>

      <FlatList
        data={JOURNAL_ENTRIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EntryCard item={item} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}