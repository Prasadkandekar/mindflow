import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chatStorage, Message } from '@/services/chatStorage';

const GEMINI_API_KEY = (process.env.EXPO_PUBLIC_GEMINI_API_KEY as string) || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `You are a compassionate and empathetic mental health companion named MindFlow Assistant. Your role is to:

1. Listen actively and validate the user's feelings without judgment
2. Provide emotional support and encouragement
3. Offer evidence-based coping strategies for stress, anxiety, and depression
4. Guide users through mindfulness and breathing exercises when appropriate
5. Help users identify patterns in their thoughts and emotions
6. Encourage healthy habits like sleep, exercise, and social connection
7. Recognize when professional help may be needed and gently suggest it

Important guidelines:
- Always be warm, supportive, and non-judgmental
- Use simple, clear language
- Ask open-ended questions to encourage reflection
- Never diagnose or prescribe medication
- If someone expresses suicidal thoughts, provide crisis resources immediately
- Respect boundaries and privacy
- Celebrate small wins and progress
- Remind users that seeking help is a sign of strength

Remember: You're a supportive companion, not a replacement for professional mental health care.`;

export default function ChatScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [rateLimitError, setRateLimitError] = useState(false);
  const lastRequestTime = useRef<number>(0);

  useEffect(() => {
    const loadChatHistory = async () => {
      const savedMessages = await chatStorage.loadMessages();
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      } else {
        const welcomeMessage: Message = {
          id: '1',
          role: 'assistant',
          content: "Hello! I'm your MindFlow companion. I'm here to listen and support you. How are you feeling today?",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
      setIsInitializing(false);
    };
    loadChatHistory();
  }, []);

  useEffect(() => {
    if (!isInitializing && messages.length > 0) {
      chatStorage.saveMessages(messages);
    }
  }, [messages, isInitializing]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    if (!GEMINI_API_KEY) {
      Alert.alert('Configuration Error', 'Gemini API key is not configured. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');
      return;
    }

    // Rate limiting: Ensure at least 4 seconds between requests (15 req/min = 1 req per 4 sec)
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    if (timeSinceLastRequest < 4000) {
      const waitTime = Math.ceil((4000 - timeSinceLastRequest) / 1000);
      Alert.alert(
        'Please Wait',
        `To avoid rate limits, please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before sending another message.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setRateLimitError(false);
    lastRequestTime.current = now;

    try {
      const conversationHistory = messages.map((m: Message) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const contents = [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I will act as a compassionate mental health companion, providing support while being clear that I am not a replacement for professional care.' }],
        },
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: userMessage.content }],
        },
      ];

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.95,
            topK: 40,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        
        // Handle rate limit error specifically
        if (response.status === 429) {
          setRateLimitError(true);
          Alert.alert(
            'Rate Limit Reached',
            'You\'ve reached the free tier limit (15 requests per minute). Please wait a minute before sending more messages.\n\nTip: Wait at least 4 seconds between messages to avoid this.',
            [{ text: 'OK' }]
          );
          throw new Error('Rate limit exceeded');
        }
        
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        'I apologize, but I had trouble processing that. Could you try again?';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev: Message[]) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      if (!rateLimitError) {
        Alert.alert(
          'Error',
          'Failed to send message. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages, rateLimitError]);

  const clearChat = useCallback(async () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await chatStorage.clearMessages();
            const welcomeMessage: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: "Hello! I'm your MindFlow companion. I'm here to listen and support you. How are you feeling today?",
              timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
          },
        },
      ]
    );
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F5' }}>
      {isInitializing ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#FF7B1B" />
          <Text style={{ color: '#8E7E77', marginTop: 16 }}>Loading your conversation...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          <LinearGradient
            colors={['#FF7B1B', '#FFAB73']}
            style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="chatbubbles" size={24} color="white" />
                </View>
                <View>
                  <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>MindFlow Companion</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Your mental health support</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={clearChat}
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {messages.map((message: Message) => (
              <View
                key={message.id}
                style={{ marginBottom: 16, alignItems: message.role === 'user' ? 'flex-end' : 'flex-start' }}
              >
                <View
                  style={{
                    maxWidth: '80%',
                    padding: 16,
                    borderRadius: 24,
                    backgroundColor: message.role === 'user' ? '#FF7B1B' : 'white',
                    borderTopRightRadius: message.role === 'user' ? 4 : 24,
                    borderTopLeftRadius: message.role === 'assistant' ? 4 : 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <Text
                    style={{
                      color: message.role === 'user' ? 'white' : '#2D1E17',
                      fontSize: 16,
                      lineHeight: 24,
                    }}
                  >
                    {message.content}
                  </Text>
                  <Text
                    style={{
                      color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : '#8E7E77',
                      fontSize: 10,
                      marginTop: 8,
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))}

            {isLoading && (
              <View style={{ alignItems: 'flex-start', marginBottom: 16 }}>
                <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 24, borderTopLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
                  <ActivityIndicator size="small" color="#FF7B1B" />
                </View>
              </View>
            )}
          </ScrollView>

          <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, backgroundColor: '#FFF9F5' }}>
            {rateLimitError && (
              <View style={{ 
                backgroundColor: 'rgba(231, 76, 60, 0.1)', 
                borderWidth: 1, 
                borderColor: 'rgba(231, 76, 60, 0.3)', 
                borderRadius: 16, 
                padding: 12, 
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Ionicons name="warning" size={20} color="#E74C3C" />
                <Text style={{ color: '#E74C3C', fontSize: 12, marginLeft: 8, flex: 1 }}>
                  Rate limit reached. Please wait 60 seconds before sending more messages.
                </Text>
              </View>
            )}
            
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 8, borderRadius: 999, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Share what's on your mind..."
                placeholderTextColor="#8E7E77"
                style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 8, color: '#2D1E17', fontSize: 16 }}
                multiline
                maxLength={500}
                onSubmitEditing={sendMessage}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: inputText.trim() && !isLoading ? '#FF7B1B' : 'rgba(255,123,27,0.2)',
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons
                    name="send"
                    size={20}
                    color={inputText.trim() ? 'white' : '#8E7E77'}
                  />
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 12 }}
              contentContainerStyle={{ paddingHorizontal: 4 }}
            >
              <TouchableOpacity
                onPress={() => setInputText("I'm feeling anxious today")}
                style={{ backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
              >
                <Text style={{ color: '#2D1E17', fontSize: 12, fontWeight: '600' }}>😰 Feeling anxious</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setInputText("I need help managing stress")}
                style={{ backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
              >
                <Text style={{ color: '#2D1E17', fontSize: 12, fontWeight: '600' }}>😓 Managing stress</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setInputText("Can you guide me through a breathing exercise?")}
                style={{ backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
              >
                <Text style={{ color: '#2D1E17', fontSize: 12, fontWeight: '600' }}>🧘 Breathing exercise</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setInputText("I'm having trouble sleeping")}
                style={{ backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
              >
                <Text style={{ color: '#2D1E17', fontSize: 12, fontWeight: '600' }}>😴 Sleep issues</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
