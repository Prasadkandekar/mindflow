import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface JournalEntry {
  id: number;
  date: string;
  time: string;
  feeling: string;
  text: string;
  emotions: any;
  confidence_score: number;
  summary: string;
  insights: any;
  created_at: string;
}

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  date: Date;
}

const JournalApp: React.FC = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [searchQuery, setSearchQuery] = useState('');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState<string>('');

  const router = useRouter();

  // Get device ID for anonymous tracking
  useEffect(() => {
    getDeviceId();
  }, []);

  // Static journal entries
  useEffect(() => {
    const staticEntries: JournalEntry[] = [
      {
        id: 1,
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        feeling: 'happy',
        text: 'Had a great day today! Feeling very productive.',
        summary: 'Productive and happy day',
        emotions: {},
        confidence_score: 0.95,
        insights: {},
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        time: '09:30 PM',
        feeling: 'neutral',
        text: 'A quiet day. Spent some time reading and relaxing.',
        summary: 'Quiet, relaxing day',
        emotions: {},
        confidence_score: 0.88,
        insights: {},
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        time: '02:15 PM',
        feeling: 'sad',
        text: 'Feeling a bit low today. Hope tomorrow is better.',
        summary: 'Feeling low',
        emotions: {},
        confidence_score: 0.85,
        insights: {},
        created_at: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    setJournalEntries(staticEntries);
    setFilteredEntries(staticEntries);
    setLoading(false);
  }, []);

  const getDeviceId = async () => {
    try {
      let id;
      if (Platform.OS === 'android') {
        id = Application.androidId;
      } else {
        id = await Application.getIosIdForVendorAsync();
      }
      setDeviceId(id || 'default-device');
    } catch (error) {
      console.error('Error getting device ID:', error);
      setDeviceId('default-device');
    }
  };

  // Fetch journal entries (Mocked)
  const fetchJournalEntries = async () => {
    setLoading(true);
    setTimeout(() => {
      setFilteredEntries(journalEntries);
      setLoading(false);
    }, 500);
  };

  // Create a new journal entry
  const createJournalEntry = () => {
    router.push('/(tabs)/home/new');
  };

  // Search journal entries
  const searchEntries = async (query: string) => {
    if (!query.trim()) {
      setFilteredEntries(journalEntries);
      return;
    }

    const filtered = journalEntries.filter(entry =>
      entry.text.toLowerCase().includes(query.toLowerCase()) ||
      entry.feeling.toLowerCase().includes(query.toLowerCase()) ||
      (entry.summary && entry.summary.toLowerCase().includes(query.toLowerCase()))
    );

    setFilteredEntries(filtered);
  };

  // Filter by feeling/mood
  const filterByFeeling = async (feeling: string) => {
    const filtered = journalEntries.filter(entry => entry.feeling === feeling);
    setFilteredEntries(filtered);
  };

  // Generate calendar days for current month
  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();

    // Add days from previous month
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      days.push({
        day,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
        date
      });
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected =
        day === selectedDate &&
        month === currentDate.getMonth() &&
        year === currentDate.getFullYear();

      days.push({
        day,
        isCurrentMonth: true,
        isSelected,
        isToday,
        date
      });
    }

    // Add days from next month to complete the grid
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextMonthDay = 1;
    for (let i = days.length; i < totalCells; i++) {
      const date = new Date(year, month + 1, nextMonthDay);
      days.push({
        day: nextMonthDay,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
        date
      });
      nextMonthDay++;
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const handleDateSelect = (day: number, isCurrentMonth: boolean, date: Date) => {
    if (isCurrentMonth) {
      setSelectedDate(day);
      // Filter entries for selected date
      const selectedDateStr = date.toISOString().split('T')[0];
      const filteredByDate = journalEntries.filter(entry => entry.date === selectedDateStr);
      setFilteredEntries(filteredByDate);
    } else {
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
      setSelectedDate(day);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(1);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get feeling emoji
  const getFeelingEmoji = (feeling: string) => {
    const feelingMap: { [key: string]: string } = {
      sad: '😢',
      neutral: '😐',
      happy: '😊',
      excited: '😃',
      excellent: '🤩',
      anxious: '😰',
      angry: '😠',
      grateful: '🙏',
      tired: '😴',
      peaceful: '😌'
    };
    return feelingMap[feeling] || '📝';
  };

  // Format date for display
  const formatJournalDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle journal card press
  const handleJournalCardPress = (entryId: number) => {
    console.log("");
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white">
        <Text className="text-xl font-semibold text-textPrimary">Journal</Text>
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Ionicons name="search" size={24} color="#777777" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search and Filters */}
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 mb-4">
            <Ionicons name="search" size={20} color="#777777" />
            <TextInput
              placeholder="Search entries..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchEntries(text);
              }}
              className="flex-1 text-textPrimary ml-3"
              placeholderTextColor="#777777"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setFilteredEntries(journalEntries);
                }}
              >
                <Ionicons name="close-circle" size={20} color="#777777" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row space-x-3"
          >
            <TouchableOpacity
              className="flex-row items-center bg-primary/10 px-4 py-2 rounded-full"
              onPress={() => {
                Alert.alert(
                  'Filter by Feeling',
                  'Select a feeling to filter',
                  [
                    { text: '😢 Sad', onPress: () => filterByFeeling('sad') },
                    { text: '😐 Neutral', onPress: () => filterByFeeling('neutral') },
                    { text: '😊 Happy', onPress: () => filterByFeeling('happy') },
                    { text: '😃 Excited', onPress: () => filterByFeeling('excited') },
                    { text: '🤩 Excellent', onPress: () => filterByFeeling('excellent') },
                    { text: '😰 Anxious', onPress: () => filterByFeeling('anxious') },
                    { text: '😠 Angry', onPress: () => filterByFeeling('angry') },
                    { text: '🙏 Grateful', onPress: () => filterByFeeling('grateful') },
                    { text: 'Clear Filter', onPress: () => setFilteredEntries(journalEntries), style: 'destructive' },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            >
              <Text className="text-primary font-medium mr-2">Feeling</Text>
              <Ionicons name="chevron-down" size={16} color="#4A90E2" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-gray-100 px-4 py-2 rounded-full"
              onPress={() => setFilteredEntries(journalEntries)}
            >
              <Text className="text-textSecondary font-medium">Show All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-green-50 px-4 py-2 rounded-full"
              onPress={() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const todayEntries = journalEntries.filter(entry => entry.date === todayStr);
                setFilteredEntries(todayEntries);
              }}
            >
              <Text className="text-green-600 font-medium">Today</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-blue-50 px-4 py-2 rounded-full"
              onPress={() => {
                const sortedByConfidence = [...filteredEntries].sort(
                  (a, b) => b.confidence_score - a.confidence_score
                );
                setFilteredEntries(sortedByConfidence);
              }}
            >
              <Text className="text-blue-600 font-medium">High Confidence</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Calendar */}
        <View className="bg-white mx-6 my-4 rounded-2xl p-4 shadow-soft">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => navigateMonth('prev')}>
              <Ionicons name="chevron-back" size={24} color="#777777" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-textPrimary">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth('next')}>
              <Ionicons name="chevron-forward" size={24} color="#777777" />
            </TouchableOpacity>
          </View>

          {/* Week Days */}
          <View className="flex-row justify-between mb-3">
            {weekDays.map((day, index) => (
              <View key={index} className="w-10 h-10 items-center justify-center">
                <Text className="text-textSecondary font-medium text-sm">{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="flex-row flex-wrap">
            {calendarDays.map((calendarDay, index) => {
              const hasEntry = journalEntries.some(entry => {
                const entryDate = new Date(entry.date);
                return (
                  entryDate.getDate() === calendarDay.day &&
                  entryDate.getMonth() === currentDate.getMonth() &&
                  entryDate.getFullYear() === currentDate.getFullYear()
                );
              });

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() =>
                    handleDateSelect(calendarDay.day, calendarDay.isCurrentMonth, calendarDay.date)
                  }
                  className="w-10 h-10 items-center justify-center m-1"
                >
                  <View
                    className={`w-8 h-8 items-center justify-center rounded-full ${calendarDay.isSelected
                        ? 'bg-primary'
                        : calendarDay.isToday
                          ? 'bg-primary/20'
                          : ''
                      }`}
                  >
                    <Text
                      className={`text-sm font-medium ${calendarDay.isSelected
                          ? 'text-white'
                          : calendarDay.isToday
                            ? 'text-primary font-semibold'
                            : calendarDay.isCurrentMonth
                              ? 'text-textPrimary'
                              : 'text-textSecondary/50'
                        }`}
                    >
                      {calendarDay.day}
                    </Text>
                    {hasEntry && calendarDay.isCurrentMonth && (
                      <View className="w-1 h-1 bg-primary rounded-full absolute bottom-1" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Journal Entries */}
        <View className="px-6 pb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-textPrimary">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : `Journal Entries - ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            </Text>
            <Text className="text-textSecondary">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>

          <TouchableOpacity onPress={fetchJournalEntries}>
            <Ionicons name="refresh" size={24} color="#4A90E2" />
          </TouchableOpacity>

          {loading ? (
            <View className="bg-white rounded-2xl p-8 items-center justify-center">
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text className="text-textSecondary mt-4">Loading journal entries...</Text>
            </View>
          ) : filteredEntries.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center justify-center">
              <Ionicons name="journal-outline" size={48} color="#777777" />
              <Text className="text-textSecondary text-lg mt-4 text-center">
                {searchQuery
                  ? `No entries found for "${searchQuery}"`
                  : 'No journal entries for this month'}
              </Text>
              <Text className="text-textSecondary text-center mt-2">
                {!searchQuery && 'Start writing to see your entries here!'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  className="bg-primary px-6 py-3 rounded-full mt-4"
                  onPress={createJournalEntry}
                >
                  <Text className="text-white font-semibold">Write First Entry</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredEntries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                className="bg-white rounded-2xl p-4 mb-3 shadow-soft active:opacity-95"
                onPress={() => handleJournalCardPress(entry.id)}
              >
                <View className="flex-row items-start">
                  <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                    <Text className="text-lg">{getFeelingEmoji(entry.feeling)}</Text>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="text-textPrimary font-semibold">
                        {formatJournalDate(entry.date)}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-textSecondary text-sm capitalize mr-2">
                          {entry.feeling}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#999999"
                        />
                      </View>
                    </View>

                    <Text className="text-textSecondary" numberOfLines={2}>
                      {entry.summary || entry.text.slice(0, 100) + '...'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* New Entry Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg active:opacity-90"
        onPress={createJournalEntry}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default JournalApp;