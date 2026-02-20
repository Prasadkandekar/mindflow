import React, { useCallback, useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

type AgentVisualizationProps = {
  style: StyleProp<ViewStyle>;
};

const barSize = 0.2;

export default function AgentVisualization({ style }: AgentVisualizationProps) {
  // On web, these packages don't exist — render a simple placeholder
  if (Platform.OS === 'web') {
    return <View style={[style, styles.container]} />;
  }

  return <NativeAgentVisualization style={style} />;
}

// Split into a separate component so hooks are always called consistently
function NativeAgentVisualization({ style }: AgentVisualizationProps) {
  const { useVoiceAssistant } = require('@livekit/components-react');
  const { BarVisualizer, VideoTrack } = require('@livekit/react-native');

  const { state, audioTrack, videoTrack } = useVoiceAssistant();
  const [barWidth, setBarWidth] = useState(0);
  const [barBorderRadius, setBarBorderRadius] = useState(0);

  const layoutCallback = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setBarWidth(barSize * height);
    setBarBorderRadius(barSize * height);
  }, []);

  const videoView = videoTrack ? (
    <VideoTrack trackRef={videoTrack} style={styles.videoTrack} />
  ) : null;

  return (
    <View style={[style, styles.container]}>
      <View style={styles.barVisualizerContainer} onLayout={layoutCallback}>
        <BarVisualizer
          state={state}
          barCount={5}
          options={{
            minHeight: barSize,
            barWidth: barWidth,
            barColor: '#FF7B1B',
            barBorderRadius: barBorderRadius,
          }}
          trackRef={audioTrack}
          style={styles.barVisualizer}
        />
      </View>
      {videoView}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTrack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  barVisualizerContainer: {
    width: '100%',
    height: '30%',
    zIndex: 0,
  },
  barVisualizer: {
    width: '100%',
    height: '100%',
  },
});
