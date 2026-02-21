import { Transcription } from '@/hooks/useDataStreamTranscriptions';
import { useCallback } from 'react';
import {
  FlatList, ListRenderItemInfo, Platform, StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from 'react-native';

export type ChatLogProps = {
  style: StyleProp<ViewStyle>;
  transcriptions: Transcription[];
};

export default function ChatLog({ style, transcriptions }: ChatLogProps) {
  if (Platform.OS === 'web') {
    return <View style={style} />;
  }
  return <NativeChatLog style={style} transcriptions={transcriptions} />;
}

function NativeChatLog({ style, transcriptions }: ChatLogProps) {
  // Conditionally require LiveKit to avoid crash when native module isn't linked
  let localParticipantIdentity = 'local';
  try {
    const { useLocalParticipant } = require('@livekit/components-react');
    const { localParticipant } = useLocalParticipant();
    localParticipantIdentity = localParticipant.identity;
  } catch (e) {
    console.warn('LiveKit components-react not available:', e);
  }

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Transcription>) => {
      const isLocalUser = item.identity === localParticipantIdentity;
      if (isLocalUser) {
        return <UserTranscriptionText text={item.segment.text} />;
      } else {
        return <AgentTranscriptionText text={item.segment.text} />;
      }
    },
    [localParticipantIdentity]
  );

  // Use standard FlatList instead of Animated.FlatList from react-native-reanimated
  // to avoid NullPointerException crash when Reanimated native module isn't available
  return (
    <FlatList
      renderItem={renderItem}
      data={transcriptions}
      style={style}
      inverted={true}
    />
  );
}

const UserTranscriptionText = (props: { text: string }) => {
  const { text } = props;
  return (
    text ? (
      <View style={styles.userTranscriptionContainer}>
        <Text style={[styles.userTranscription, styles.userTranscriptionDark]}>
          {text}
        </Text>
      </View>
    ) : null
  );
};

const AgentTranscriptionText = (props: { text: string }) => {
  const { text } = props;
  return text ? <Text style={styles.agentTranscription}>{text}</Text> : null;
};

const styles = StyleSheet.create({
  userTranscriptionContainer: {
    width: '100%',
    alignContent: 'flex-end',
  },
  userTranscription: {
    width: 'auto',
    fontSize: 17,
    alignSelf: 'flex-end',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 16,
  },
  userTranscriptionDark: {
    backgroundColor: '#3D2E27',
    color: '#FFFFFF',
  },
  agentTranscription: {
    fontSize: 17,
    textAlign: 'left',
    margin: 16,
    color: '#2D1E17',
  },
});
