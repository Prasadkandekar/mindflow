import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CHAT_HISTORY_KEY = '@mindflow_chat_history';
const MAX_MESSAGES = 100; // Limit stored messages

export const chatStorage = {
  async saveMessages(messages: Message[]): Promise<void> {
    try {
      // Keep only the last MAX_MESSAGES
      const messagesToSave = messages.slice(-MAX_MESSAGES);
      const jsonValue = JSON.stringify(messagesToSave);
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving chat messages:', error);
    }
  },

  async loadMessages(): Promise<Message[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      if (jsonValue != null) {
        const messages = JSON.parse(jsonValue);
        // Convert timestamp strings back to Date objects
        return messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading chat messages:', error);
      return [];
    }
  },

  async clearMessages(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing chat messages:', error);
    }
  },
};
