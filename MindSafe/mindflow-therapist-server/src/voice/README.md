# Voice Agent Module

This module contains the LiveKit voice agent integration for the MindFlow Therapist application.

## Directory Structure

```
src/voice/
├── config.ts           # Environment configuration and validation
├── types/              # TypeScript type definitions
│   └── index.ts
├── services/           # Service implementations (STT, TTS, Audio Processing)
└── handlers/           # RPC and event handlers
```

## Configuration

The voice agent requires the following environment variables:

### Required Variables
- `LIVEKIT_URL` - LiveKit server WebSocket URL
- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret
- `STT_PROVIDER` - Speech-to-Text provider (deepgram, google, whisper)
- `TTS_PROVIDER` - Text-to-Speech provider (elevenlabs, google, openai)
- `TOKEN_GENERATOR_URL` - URL of the token generator service

### Optional Variables
- `DEEPGRAM_API_KEY` - API key for Deepgram STT (if using Deepgram)
- `ELEVENLABS_API_KEY` - API key for ElevenLabs TTS (if using ElevenLabs)
- `LOG_LEVEL` - Logging level (debug, info, warn, error)

## Usage

The voice agent will be integrated into the existing Express server and will provide:

1. **Session Management** - Create and manage voice sessions
2. **Audio Processing** - Handle audio streams with VAD, STT, and TTS
3. **RPC Methods** - Expose methods for client-agent communication
4. **Backend Integration** - Connect with existing chat controller for AI responses

## Implementation Status

- [x] Project structure setup
- [ ] Core VoiceAgent class (Task 2)
- [ ] RPC method registration (Task 3)
- [ ] Audio processing pipeline (Task 5)
- [ ] VAD integration (Task 6)
- [ ] STT integration (Task 7)
- [ ] TTS integration (Task 8)
- [ ] Session state management (Task 10)
- [ ] Session persistence (Task 11)
- [ ] Error handling (Task 12)
- [ ] Token management (Task 13)
- [ ] Backend API integration (Task 16)
- [ ] Web client components (Task 17)

## Testing

Tests are located in the `tests/` directory at the project root.

Run tests with:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```
