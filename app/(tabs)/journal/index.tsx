import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../services/supabase';

const ACTOR_ID = '6ceaaeea-91f5-427d-bb4e-d651e2a2fd61';

interface JournalEntry {
  id: string;
  content: string;
  entry_date: string;
  sentiment_analysis?: {
    sentiment_score: number;
    emotion_label: string;
  };
}

const FilterButton = ({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-6 py-2.5 rounded-full mr-2 shadow-sm ${active ? 'bg-primary' : 'bg-white border border-secondary/20'}`}
  >
    <Text className={`font-bold text-sm ${active ? 'text-white' : 'text-textSecondary'}`}>{label}</Text>
  </TouchableOpacity>
);

const EntryCard = ({ item, onPress }: { item: JournalEntry, onPress: () => void }) => {
  const date = new Date(item.entry_date);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const title = item.content.split('\n')[0].substring(0, 25) + (item.content.split('\n')[0].length > 25 ? '...' : '');
  const preview = item.content.length > 80 ? item.content.substring(0, 80) + '...' : item.content;
  const sentimentScore = item.sentiment_analysis?.sentiment_score ?? 0.5;
  const rating = Math.ceil(sentimentScore * 5);
  const mood = item.sentiment_analysis?.emotion_label || 'Neutral';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white p-5 rounded-[32px] mb-4 shadow-card border border-secondary/10"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-textSecondary font-bold text-[10px] uppercase tracking-widest">{formattedDate}</Text>
          <Text className="text-textPrimary font-bold text-lg">{title}</Text>
        </View>
        <View className="flex-row bg-background px-2 py-1 rounded-full">
          {[...Array(5)].map((_, i) => (
            <Ionicons key={i} name="star" size={10} color={i < rating ? "#FF7B1B" : "#D4C5BD"} />
          ))}
        </View>
      </View>
      <Text className="text-textSecondary text-sm leading-relaxed" numberOfLines={2}>{preview}</Text>
      <View className="mt-4 flex-row items-center justify-between">
        <View className={`px-4 py-1.5 rounded-full ${sentimentScore > 0.6 ? 'bg-mood-happy/10' : 'bg-mood-stressed/10'}`}>
          <Text className={`text-[10px] font-bold uppercase tracking-wider ${sentimentScore > 0.6 ? 'text-primary' : 'text-textSecondary'}`}>{mood}</Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={24} color="#FF7B1B" />
      </View>
    </TouchableOpacity>
  );
};

export default function JournalScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journals')
        .select(`
                    id,
                    content,
                    entry_date,
                    created_at,
                    sentiment_analysis (
                        sentiment_score,
                        emotion_label
                    )
                `)
        .eq('user_id', ACTOR_ID)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedEntries = data.map(entry => ({
        ...entry,
        sentiment_analysis: Array.isArray(entry.sentiment_analysis)
          ? entry.sentiment_analysis[0]
          : entry.sentiment_analysis
      }));

      setEntries(formattedEntries);
    } catch (error) {
      console.error('Error fetching journals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEntries();
  };

  const filteredEntries = entries.filter(entry => {
    if (filter === 'All') return true;
    if (filter === 'Positive') return (entry.sentiment_analysis?.sentiment_score ?? 0) > 0.6;
    if (filter === 'Difficult Days') return (entry.sentiment_analysis?.sentiment_score ?? 0) <= 0.4;
    return true;
  });

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

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7B1B" />
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EntryCard
              item={item}
              onPress={() => router.push({
                pathname: '/journal/entry-detail',
                params: { id: item.id }
              })}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF7B1B']} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Ionicons name="journal-outline" size={64} color="#D4C5BD" />
              <Text className="text-textSecondary mt-4 font-medium">No journal entries found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}