import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  useAnimatedValue,
  View,
  ViewStyle,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import useDataStreamTranscriptions from '@/hooks/useDataStreamTranscriptions';
import AgentVisualization from './ui/AgentVisualization';
import ChatBar from './ui/ChatBar';
import ChatLog from './ui/ChatLog';
import ControlBar from './ui/ControlBar';
import WebSessionView from './ui/WebSessionView';

// ─── Main Screen ─────────────────────────────────────────────────────────────
// On web: use WebSessionView (livekit-client — browser native WebRTC).
// On native: use the full LiveKit React Native implementation.

export default function ActiveSessionScreen() {
  if (Platform.OS === 'web') {
    return <WebSessionView />;
  }
  return <NativeSessionScreen />;
}

// ─── Native-only Session Screen ───────────────────────────────────────────────
// All LiveKit imports live inside this component so they are only ever
// evaluated on native platforms (iOS / Android).

function NativeSessionScreen() {
  const { AudioSession, LiveKitRoom } = require('@livekit/react-native');
  const { token, url } = useLocalSearchParams<{ token: string; url: string }>();

  useEffect(() => {
    const start = async () => {
      await AudioSession.startAudioSession();
    };
    start();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  const serverUrl = (url as string) || 'wss://mental-wellness-3z07873b.livekit.cloud';

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token as string}
        connect={true}
        audio={true}
        video={false}
      >
        <RoomView />
      </LiveKitRoom>
    </SafeAreaView>
  );
}

// ─── Room View ────────────────────────────────────────────────────────────────

const RoomView = () => {
  const {
    useIOSAudioManagement,
    useLocalParticipant,
    useParticipantTracks,
    useRoomContext,
    VideoTrack,
  } = require('@livekit/react-native');
  const { Track } = require('livekit-client');

  const router = useRouter();

  const room = useRoomContext();
  useIOSAudioManagement(room, true);

  const {
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
    cameraTrack: localCameraTrack,
    localParticipant,
  } = useLocalParticipant();
  const localParticipantIdentity = localParticipant.identity;

  const localScreenShareTrack = useParticipantTracks(
    [Track.Source.ScreenShare],
    localParticipantIdentity
  );

  const localVideoTrack =
    localCameraTrack && isCameraEnabled
      ? {
        participant: localParticipant,
        publication: localCameraTrack,
        source: Track.Source.Camera,
      }
      : localScreenShareTrack.length > 0 && isScreenShareEnabled
        ? localScreenShareTrack[0]
        : null;

  // Transcriptions
  const transcriptionState = useDataStreamTranscriptions();
  const addTranscription = transcriptionState.addTranscription;
  const [isChatEnabled, setChatEnabled] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const onChatSend = useCallback(
    (message: string) => {
      addTranscription(localParticipantIdentity, message);
      setChatMessage('');
    },
    [localParticipantIdentity, addTranscription, setChatMessage]
  );

  // Control callbacks
  const onMicClick = useCallback(() => {
    localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  }, [isMicrophoneEnabled, localParticipant]);

  const onCameraClick = useCallback(() => {
    localParticipant.setCameraEnabled(!isCameraEnabled);
  }, [isCameraEnabled, localParticipant]);

  const onScreenShareClick = useCallback(() => {
    localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
  }, [isScreenShareEnabled, localParticipant]);

  const onChatClick = useCallback(() => {
    setChatEnabled(!isChatEnabled);
  }, [isChatEnabled, setChatEnabled]);

  const onExitClick = useCallback(() => {
    router.back();
  }, [router]);

  // Layout positioning
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width);
  const [containerHeight, setContainerHeight] = useState(Dimensions.get('window').height);

  const agentVisualizationPosition = useAgentVisualizationPosition(
    isChatEnabled,
    isCameraEnabled || isScreenShareEnabled
  );
  const localVideoPosition = useLocalVideoPosition(isChatEnabled, {
    width: containerWidth,
    height: containerHeight,
  });

  let localVideoView = localVideoTrack ? (
    <Animated.View
      style={[
        {
          position: 'absolute',
          zIndex: 1,
          ...localVideoPosition,
        },
      ]}
    >
      <VideoTrack trackRef={localVideoTrack} style={styles.video} />
    </Animated.View>
  ) : null;

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerWidth(width);
        setContainerHeight(height);
      }}
    >
      <View style={styles.spacer} />
      <ChatLog
        style={styles.logContainer}
        transcriptions={transcriptionState.transcriptions}
      />
      <ChatBar
        style={styles.chatBar}
        value={chatMessage}
        onChangeText={(value) => {
          setChatMessage(value);
        }}
        onChatSend={onChatSend}
      />

      <Animated.View
        style={[
          {
            position: 'absolute',
            zIndex: 1,
            backgroundColor: '#FAF0EA',
            ...agentVisualizationPosition,
          },
        ]}
      >
        <AgentVisualization style={styles.agentVisualization} />
      </Animated.View>

      {localVideoView}

      <ControlBar
        style={styles.controlBar}
        options={{
          isMicEnabled: isMicrophoneEnabled,
          isCameraEnabled,
          isScreenShareEnabled,
          isChatEnabled,
          onMicClick,
          onCameraClick,
          onChatClick,
          onScreenShareClick,
          onExitClick,
        }}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF0EA',
  },
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  spacer: {
    height: '24%',
  },
  logContainer: {
    width: '100%',
    flexGrow: 1,
    flexDirection: 'column',
    marginBottom: 8,
  },
  chatBar: {
    left: 0,
    right: 0,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  controlBar: {
    left: 0,
    right: 0,
    zIndex: 2,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  agentVisualization: {
    width: '100%',
    height: '100%',
  },
});

// ─── Animation Helpers ────────────────────────────────────────────────────────

const expandedAgentWidth = 1;
const expandedAgentHeight = 1;
const expandedLocalWidth = 0.3;
const expandedLocalHeight = 0.2;
const collapsedWidth = 0.3;
const collapsedHeight = 0.2;

const createAnimConfig = (toValue: any) => {
  return {
    toValue,
    stiffness: 200,
    damping: 30,
    useNativeDriver: false,
    isInteraction: false,
    overshootClamping: true,
  };
};

const useAgentVisualizationPosition = (
  isChatVisible: boolean,
  hasLocalVideo: boolean
) => {
  const width = useAnimatedValue(isChatVisible ? collapsedWidth : expandedAgentWidth);
  const height = useAnimatedValue(isChatVisible ? collapsedHeight : expandedAgentHeight);

  useEffect(() => {
    const widthAnim = Animated.spring(
      width,
      createAnimConfig(isChatVisible ? collapsedWidth : expandedAgentWidth)
    );
    const heightAnim = Animated.spring(
      height,
      createAnimConfig(isChatVisible ? collapsedHeight : expandedAgentHeight)
    );
    widthAnim.start();
    heightAnim.start();
    return () => {
      widthAnim.stop();
      heightAnim.stop();
    };
  }, [width, height, isChatVisible]);

  const x = useAnimatedValue(0);
  const y = useAnimatedValue(0);

  useEffect(() => {
    let targetX: number;
    let targetY: number;

    if (!isChatVisible) {
      targetX = 0;
      targetY = 0;
    } else {
      if (!hasLocalVideo) {
        targetX = 0.5 - collapsedWidth / 2;
        targetY = 16;
      } else {
        targetX = 0.32 - collapsedWidth / 2;
        targetY = 16;
      }
    }

    const xAnim = Animated.spring(x, createAnimConfig(targetX));
    const yAnim = Animated.spring(y, createAnimConfig(targetY));
    xAnim.start();
    yAnim.start();

    return () => {
      xAnim.stop();
      yAnim.stop();
    };
  }, [x, y, isChatVisible, hasLocalVideo]);

  return {
    left: x.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
    top: y,
    width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
    height: height.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
  };
};

const useLocalVideoPosition = (
  isChatVisible: boolean,
  containerDimens: { width: number; height: number }
): ViewStyle => {
  const width = useAnimatedValue(isChatVisible ? collapsedWidth : expandedLocalWidth);
  const height = useAnimatedValue(isChatVisible ? collapsedHeight : expandedLocalHeight);

  useEffect(() => {
    const widthAnim = Animated.spring(
      width,
      createAnimConfig(isChatVisible ? collapsedWidth : expandedLocalWidth)
    );
    const heightAnim = Animated.spring(
      height,
      createAnimConfig(isChatVisible ? collapsedHeight : expandedLocalHeight)
    );
    widthAnim.start();
    heightAnim.start();
    return () => {
      widthAnim.stop();
      heightAnim.stop();
    };
  }, [width, height, isChatVisible]);

  const x = useAnimatedValue(0);
  const y = useAnimatedValue(0);

  useEffect(() => {
    let targetX: number;
    let targetY: number;

    if (!isChatVisible) {
      targetX = 1 - expandedLocalWidth - 16 / containerDimens.width;
      targetY = 1 - expandedLocalHeight - 106 / containerDimens.height;
    } else {
      targetX = 0.66 - collapsedWidth / 2;
      targetY = 0;
    }

    const xAnim = Animated.spring(x, createAnimConfig(targetX));
    const yAnim = Animated.spring(y, createAnimConfig(targetY));
    xAnim.start();
    yAnim.start();

    return () => {
      xAnim.stop();
      yAnim.stop();
    };
  }, [containerDimens.width, containerDimens.height, x, y, isChatVisible]);

  return {
    left: x.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
    top: y.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
    width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
    height: height.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
    marginTop: 16,
  } as any;
};
