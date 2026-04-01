# VoiceAgent Usage Guide

## Overview

The `VoiceAgent` class manages LiveKit room connections, audio track publishing, and handles reconnection logic for voice-based interactions.

## Basic Usage

```typescript
import { VoiceAgent, AgentConnectionState } from './voice';
import { VoiceAgentConfig } from './voice/types';

// 1. Create configuration
const config: VoiceAgentConfig = {
  livekitUrl: process.env.LIVEKIT_URL!,
  apiKey: process.env.LIVEKIT_API_KEY!,
  apiSecret: process.env.LIVEKIT_API_SECRET!,
  backendUrl: process.env.BACKEND_URL!,
  sttProvider: 'deepgram',
  ttsProvider: 'elevenlabs'
};

// 2. Create VoiceAgent instance
const agent = new VoiceAgent(config);

// 3. Set up event listeners
agent.on('connected', ({ roomName }) => {
  console.log(`Connected to room: ${roomName}`);
});

agent.on('disconnected', () => {
  console.log('Disconnected from room');
});

agent.on('error', ({ error, context }) => {
  console.error(`Error in ${context}:`, error);
});

agent.on('reconnecting', ({ attempt, maxAttempts, delay }) => {
  console.log(`Reconnecting... Attempt ${attempt}/${maxAttempts} (delay: ${delay}ms)`);
});

agent.on('audioTrackPublished', ({ trackSid }) => {
  console.log(`Audio track published: ${trackSid}`);
});

// 4. Connect to a room
const roomName = 'my-therapy-session';
const token = 'your-livekit-jwt-token';

try {
  await agent.connectToRoom(roomName, token);
  console.log('Successfully connected and audio track published');
} catch (error) {
  console.error('Failed to connect:', error);
}

// 5. Check connection state
if (agent.isConnected()) {
  console.log('Agent is connected');
  console.log('Current state:', agent.getConnectionState());
}

// 6. Access room and audio components
const room = agent.getRoom();
const audioTrack = agent.getAudioTrack();
const audioSource = agent.getAudioSource();

// 7. Disconnect when done
await agent.disconnect();
```

## Connection States

The agent tracks the following connection states:

- `DISCONNECTED` - Not connected to any room
- `CONNECTING` - Attempting to connect to a room
- `CONNECTED` - Successfully connected to a room
- `RECONNECTING` - Attempting to reconnect after disconnection
- `ERROR` - Connection error occurred

## Reconnection Logic

The agent automatically attempts to reconnect if the connection is lost:

- **Max attempts**: 3
- **Delays**: 1s, 2s, 4s (exponential backoff)
- **Events**: Emits `reconnecting` and `reconnectionFailed` events

## Event Reference

### connected
Emitted when successfully connected to a room.
```typescript
agent.on('connected', ({ roomName }) => {
  // Handle connection
});
```

### disconnected
Emitted when disconnected from a room.
```typescript
agent.on('disconnected', () => {
  // Handle disconnection
});
```

### connecting
Emitted when starting to connect to a room.
```typescript
agent.on('connecting', ({ roomName }) => {
  // Handle connection start
});
```

### reconnecting
Emitted when attempting to reconnect.
```typescript
agent.on('reconnecting', ({ attempt, maxAttempts, delay, timestamp }) => {
  // Handle reconnection attempt
});
```

### reconnectionFailed
Emitted when a reconnection attempt fails.
```typescript
agent.on('reconnectionFailed', ({ attempt, error, timestamp }) => {
  // Handle reconnection failure
});
```

### error
Emitted when an error occurs.
```typescript
agent.on('error', ({ error, context }) => {
  // Handle error
});
```

### audioTrackPublished
Emitted when the audio track is successfully published.
```typescript
agent.on('audioTrackPublished', ({ trackSid }) => {
  // Handle audio track publication
});
```

### stateChanged
Emitted when the connection state changes.
```typescript
agent.on('stateChanged', ({ previousState, currentState }) => {
  // Handle state change
});
```

### participantConnected
Emitted when a participant joins the room.
```typescript
agent.on('participantConnected', ({ identity }) => {
  // Handle participant connection
});
```

### participantDisconnected
Emitted when a participant leaves the room.
```typescript
agent.on('participantDisconnected', ({ identity }) => {
  // Handle participant disconnection
});
```

## Requirements Implemented

- **Requirement 1.1**: Voice Agent connects to LiveKit room with valid token
- **Requirement 1.2**: Voice Agent authenticates using token
- **Requirement 1.3**: Voice Agent publishes audio track with 16kHz sample rate and mono channel
- **Requirement 1.4**: Voice Agent detects client disconnection
- **Requirement 1.5**: Voice Agent implements reconnection with exponential backoff (max 3 attempts)
- **Requirement 1.6**: Voice Agent disconnects and releases all resources on session end

## Next Steps

After implementing the core VoiceAgent class, the next tasks include:

1. Implementing RPC method registration and handling
2. Implementing audio processing pipeline
3. Integrating Voice Activity Detection (VAD)
4. Integrating Speech-to-Text (STT)
5. Integrating Text-to-Speech (TTS)
6. Implementing session state management
