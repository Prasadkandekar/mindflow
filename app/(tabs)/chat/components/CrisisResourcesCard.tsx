import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';

export default function CrisisResourcesCard() {
  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  const callNumber = (number: string) => {
    Linking.openURL(`tel:${number}`).catch((err) => console.error('Failed to call:', err));
  };

  return (
    <View style={{ 
      backgroundColor: 'rgba(231, 76, 60, 0.1)', 
      borderWidth: 1, 
      borderColor: 'rgba(231, 76, 60, 0.3)', 
      borderRadius: 24, 
      padding: 16, 
      marginBottom: 16 
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Ionicons name="alert-circle" size={24} color="#E74C3C" />
        <Text style={{ color: '#2D1E17', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }}>Crisis Resources</Text>
      </View>

      <Text style={{ color: '#8E7E77', fontSize: 14, marginBottom: 12 }}>
        If you're in crisis or need immediate help, please reach out:
      </Text>

      <TouchableOpacity
        onPress={() => callNumber('988')}
        style={{ 
          backgroundColor: 'white', 
          padding: 12, 
          borderRadius: 16, 
          marginBottom: 8, 
          flexDirection: 'row', 
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2
        }}
      >
        <Ionicons name="call" size={20} color="#FF7B1B" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ color: '#2D1E17', fontWeight: 'bold' }}>988 - Suicide & Crisis Lifeline</Text>
          <Text style={{ color: '#8E7E77', fontSize: 12 }}>24/7 support (US)</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Linking.openURL('sms:741741&body=HOME')}
        style={{ 
          backgroundColor: 'white', 
          padding: 12, 
          borderRadius: 16, 
          marginBottom: 8, 
          flexDirection: 'row', 
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2
        }}
      >
        <Ionicons name="chatbubble" size={20} color="#FF7B1B" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ color: '#2D1E17', fontWeight: 'bold' }}>Text HOME to 741741</Text>
          <Text style={{ color: '#8E7E77', fontSize: 12 }}>Crisis Text Line (US)</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => openLink('https://findahelpline.com')}
        style={{ 
          backgroundColor: 'white', 
          padding: 12, 
          borderRadius: 16, 
          flexDirection: 'row', 
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2
        }}
      >
        <Ionicons name="globe" size={20} color="#FF7B1B" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ color: '#2D1E17', fontWeight: 'bold' }}>International Resources</Text>
          <Text style={{ color: '#8E7E77', fontSize: 12 }}>findahelpline.com</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
