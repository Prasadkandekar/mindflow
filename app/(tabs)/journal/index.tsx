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

const FilterButton = ({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-6 py-2.5 rounded-full mr-2 shadow-sm ${active ? 'bg-primary' : 'bg-white border border-secondary/20'}`}
  >
    <Text className={`font-bold text-sm ${active ? 'text-white' : 'text-textSecondary'}`}>{label}</Text>
  </TouchableOpacity>
);

const EntryCard = ({ item, onPress }: { item: typeof JOURNAL_ENTRIES[0], onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white p-5 rounded-[32px] mb-4 shadow-card border border-secondary/10"
  >
    <View className="flex-row justify-between items-start mb-2">
      <View>
        <Text className="text-textSecondary font-bold text-[10px] uppercase tracking-widest">{item.date}</Text>
        <Text className="text-textPrimary font-bold text-lg">{item.title}</Text>
      </View>
      <View className="flex-row bg-background px-2 py-1 rounded-full">
        {[...Array(5)].map((_, i) => (
          <Ionicons key={i} name="star" size={10} color={i < item.rating ? "#FF7B1B" : "#D4C5BD"} />
        ))}
      </View>
    </View>
    <Text className="text-textSecondary text-sm leading-relaxed" numberOfLines={2}>{item.preview}</Text>
    <View className="mt-4 flex-row items-center justify-between">
      <View className={`px-4 py-1.5 rounded-full ${item.mood === 'Positive' ? 'bg-mood-happy/10' : 'bg-mood-stressed/10'}`}>
        <Text className={`text-[10px] font-bold uppercase tracking-wider ${item.mood === 'Positive' ? 'text-primary' : 'text-textSecondary'}`}>{item.mood}</Text>
      </View>
      <Ionicons name="arrow-forward-circle" size={24} color="#FF7B1B" />
    </View>
  </TouchableOpacity>
);

export default function JournalScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 py-6 flex-row justify-between items-center">
        <Text className="text-3xl font-bold text-textPrimary">Your Journal 📔</Text>
        <TouchableOpacity
          onPress={() => router.push('/home/add-journal')}
          className="w-12 h-12 bg-primary rounded-2xl items-center justify-center shadow-soft"
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <View className="py-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}>
          <FilterButton label="All" active={filter === 'All'} onPress={() => setFilter('All')} />
          <FilterButton label="Positive" active={filter === 'Positive'} onPress={() => setFilter('Positive')} />
          <FilterButton label="Difficult Days" active={filter === 'Difficult Days'} onPress={() => setFilter('Difficult Days')} />
        </ScrollView>
      </View>

      <FlatList
        data={JOURNAL_ENTRIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EntryCard item={item} onPress={() => router.push('/journal/entry-detail')} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}