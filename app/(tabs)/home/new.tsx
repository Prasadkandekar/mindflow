import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewJournalEntry() {
  const [text, setText] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  const moods = [
    { emoji: "😢", label: "Sad" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "😊", label: "Good" },
    { emoji: "😃", label: "Happy" },
    { emoji: "🤩", label: "Excellent" },
  ];

  const handleSaveEntry = async () => {
    if (!text.trim()) {
      Alert.alert("Empty Entry", "Please add some text to your journal entry");
      return;
    }

    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert("Success", "Journal entry saved successfully!");

      // Reset form
      setText("");
      setMood(null);
      // Navigate back to journal list
      router.push("/(tabs)/journal");
    } catch (error: any) {
      console.error('Error saving journal entry:', error);
      Alert.alert("Error", "Failed to save journal entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const clearEntry = () => {
    Alert.alert("Clear Entry", "Are you sure you want to clear this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          setText("");
          setMood(null);
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
            <Ionicons name="close" size={24} color="#2D1E17" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-textPrimary">New Entry</Text>
          <TouchableOpacity onPress={clearEntry}>
            <Text className="text-primary font-bold">Clear</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-8">
          <Text className="text-3xl font-bold text-textPrimary mb-2 leading-tight">
            Write Your {"\n"}Heart Out
          </Text>
          <Text className="text-textSecondary font-medium">
            Express your thoughts and feelings securely.
          </Text>
        </View>

        {/* Mood Selector */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-textPrimary mb-4">
            How are you feeling?
          </Text>
          <View className="flex-row gap-2">
            {moods.map((moodItem, index) => (
              <TouchableOpacity
                key={index}
                className={`items-center p-4 rounded-[24px] flex-1 ${mood === index ? "bg-primary shadow-soft" : "bg-white shadow-card"
                  }`}
                onPress={() => setMood(index)}
              >
                <Text className="text-2xl mb-1">{moodItem.emoji}</Text>
                <Text className={`text-[10px] font-bold uppercase ${mood === index ? "text-white" : "text-textSecondary"
                  }`}>
                  {moodItem.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Journal Text Input */}
        <View className="mb-6">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Start writing your thoughts here..."
            placeholderTextColor="#8E7E77"
            multiline
            textAlignVertical="top"
            className="h-64 bg-white rounded-[32px] p-6 text-base text-textPrimary shadow-card"
          />
        </View>

        {/* Security Badge */}
        <View className="flex-row items-center justify-center bg-white/50 rounded-full py-3 mb-8">
          <Ionicons name="lock-closed" size={16} color="#FF7B1B" />
          <Text className="ml-2 text-[10px] text-textSecondary font-bold uppercase tracking-wider">
            End-to-end encrypted
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleSaveEntry}
          disabled={!text.trim() || isSaving}
          className={`px-6 py-5 rounded-[24px] items-center mb-8 shadow-soft ${text.trim() && !isSaving ? "bg-primary" : "bg-secondary/40"
            }`}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Save My Thoughts</Text>
          )}
        </TouchableOpacity>

        {/* Character Count */}
        <View className="items-center mb-20">
          <Text className="text-xs text-textSecondary font-medium">
            {text.length} characters • {text.split(/\s+/).filter(word => word.length > 0).length} words
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}