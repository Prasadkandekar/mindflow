
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

const InitialMessage: Message = {
  id: "init-1",
  text: "Hi there! How can I help you today?",
  sender: "bot",
};

const cleanText = (text: string) => {
  return text.replace(/[#*_~`]/g, "").replace(/\n\s*\n/g, "\n").trim();
};

export default function MentalHealthChatScreen() {
  const [messages, setMessages] = useState<Message[]>([InitialMessage]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    Keyboard.dismiss();

    try {
      // Simulate Bot thinking
      const botMessageId = Date.now().toString() + "-bot";

      setTimeout(() => {
        const botMessage: Message = {
          id: botMessageId,
          text: `I'm here to support you. It sounds like you're thinking about "${currentInput}". How does that make you feel?`,
          sender: "bot",
        };
        setMessages((prev) => [...prev, botMessage]);
      }, 1000);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20} // adjust if header exists
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1">
          {/* Chat messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
            renderItem={({ item }) => (
              <View
                className={`my-2 ${item.sender === "user" ? "items-end" : "items-start"
                  }`}
              >
                <Text
                  className={`text-xs text-gray-500 mb-1 ${item.sender === "user" ? "text-right" : "text-left"
                    }`}
                >
                  {item.sender === "user" ? "You" : "MasterMind"}
                </Text>
                <View
                  className={`rounded-2xl px-4 py-3 max-w-[85%] ${item.sender === "user"
                      ? "bg-blue-500 rounded-br-none"
                      : "bg-white border border-gray-200 rounded-bl-none"
                    }`}
                >
                  <Text
                    className={
                      item.sender === "user" ? "text-white" : "text-gray-800"
                    }
                  >
                    {item.text}
                  </Text>
                </View>
              </View>
            )}
          />

          {/* Input bar */}
          <View className="bg-white border-t border-gray-200 px-4 py-3">
            <View className="flex-row items-center">
              <TextInput
                className="flex-1 h-12 bg-gray-100 rounded-full px-4 text-gray-800 mr-2"
                value={input}
                onChangeText={setInput}
                placeholder="Type your message..."
                placeholderTextColor="#9ca3af"
                multiline
                returnKeyType="send"
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity
                className={`w-12 h-12 rounded-full items-center justify-center ${input.trim() ? "bg-blue-500" : "bg-gray-300"
                  }`}
                onPress={sendMessage}
                disabled={!input.trim()}
              >
                <Text className="text-white text-lg font-bold">↑</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
