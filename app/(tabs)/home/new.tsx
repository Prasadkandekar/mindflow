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
    <ScrollView className="flex-1 bg-gray-50 p-6" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          New Journal Entry
        </Text>
        <Text className="text-gray-600">
          Express your thoughts and feelings securely
        </Text>
      </View>

      {/* Mood Selector */}
      <View className="mb-8">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          How are you feeling today?
        </Text>
        <View className="flex-row justify-between">
          {moods.map((moodItem, index) => (
            <TouchableOpacity
              key={index}
              className={`items-center p-3 rounded-2xl flex-1 mx-1 ${mood === index ? "bg-blue-100 border-2 border-blue-500" : "bg-white border border-gray-200"
                }`}
              onPress={() => setMood(index)}
            >
              <Text className="text-3xl mb-1">{moodItem.emoji}</Text>
              <Text className={`text-xs font-medium ${mood === index ? "text-blue-700" : "text-gray-600"
                }`}>
                {moodItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Journal Text Input */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-800">
            What's on your mind?
          </Text>
          <TouchableOpacity onPress={clearEntry}>
            <Text className="text-red-500 text-sm font-medium">Clear</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Start writing your thoughts here..."
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          className="h-48 bg-white border border-gray-300 rounded-2xl p-4 text-base text-gray-800 shadow-sm"
        />
      </View>

      {/* Security Badge */}
      <View className="flex-row items-center justify-center bg-blue-50 rounded-2xl p-4 mb-6">
        <Ionicons name="shield-checkmark" size={20} color="#4A90E2" />
        <Text className="ml-2 text-sm text-blue-700 font-medium">
          🔒 End-to-end encrypted • Your data is secure
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row space-x-4 mb-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-1 bg-gray-200 px-6 py-4 rounded-2xl items-center"
        >
          <Text className="text-gray-700 font-semibold">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSaveEntry}
          disabled={!text.trim() || isSaving}
          className={`flex-1 px-6 py-4 rounded-2xl items-center ${text.trim() && !isSaving ? "bg-blue-600" : "bg-blue-300"
            }`}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Save Entry</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Character Count */}
      <View className="items-center">
        <Text className="text-sm text-gray-500">
          {text.length} characters • {text.split(/\s+/).filter(word => word.length > 0).length} words
        </Text>
      </View>
    </ScrollView>
  );
}