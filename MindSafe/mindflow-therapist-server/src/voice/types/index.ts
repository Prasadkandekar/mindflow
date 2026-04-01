// Type definitions for the voice agent service

export interface VoiceAgentConfig {
  livekitUrl: string;
  apiKey: string;
  apiSecret: string;
  backendUrl: string;
  sttProvider: 'deepgram' | 'google' | 'whisper';
  ttsProvider: 'elevenlabs' | 'google' | 'openai';
}

export interface SessionState {
  sessionId: string;
  roomName: string;
  userId: string;
  startTime: Date;
  isActive: boolean;
  messageCount: number;
  audioBuffer: Int16Array[];
}

export interface AudioFrame {
  data: Int16Array;
  sampleRate: number;
  channels: number;
  samplesPerChannel: number;
}

export interface AudioData {
  samples: Int16Array;
  sampleRate: number;
  channels: number;
}

export interface RPCRequest {
  method: string;
  params: Record<string, any>;
  requestId: string;
}

export interface RPCResponse {
  success: boolean;
  data?: any;
  error?: string;
  requestId: string;
}

export interface StartSessionParams {
  userId: string;
  sessionId: string;
}

export interface EndSessionParams {
  sessionId: string;
}

export interface LogMessageParams {
  sessionId: string;
  message: string;
  timestamp: string;
  speaker: 'user' | 'agent';
}
