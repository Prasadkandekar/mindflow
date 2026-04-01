import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface VoiceConfig {
  livekit: {
    url: string;
    apiKey: string;
    apiSecret: string;
  };
  stt: {
    provider: 'deepgram' | 'google' | 'whisper';
    apiKey: string;
  };
  tts: {
    provider: 'elevenlabs' | 'google' | 'openai';
    apiKey: string;
  };
  tokenGenerator: {
    url: string;
  };
  logging: {
    level: string;
  };
}

/**
 * Validates that all required environment variables are present
 * Throws an error with descriptive message if any are missing
 */
export function validateVoiceConfig(): void {
  const requiredVars = [
    'LIVEKIT_URL',
    'LIVEKIT_API_KEY',
    'LIVEKIT_API_SECRET',
    'STT_PROVIDER',
    'TTS_PROVIDER',
    'TOKEN_GENERATOR_URL'
  ];

  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for voice agent: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Validate STT provider
  const sttProvider = process.env.STT_PROVIDER;
  if (!['deepgram', 'google', 'whisper'].includes(sttProvider!)) {
    throw new Error(
      `Invalid STT_PROVIDER: ${sttProvider}. Must be one of: deepgram, google, whisper`
    );
  }

  // Validate TTS provider
  const ttsProvider = process.env.TTS_PROVIDER;
  if (!['elevenlabs', 'google', 'openai'].includes(ttsProvider!)) {
    throw new Error(
      `Invalid TTS_PROVIDER: ${ttsProvider}. Must be one of: elevenlabs, google, openai`
    );
  }
}

/**
 * Loads and returns the voice configuration
 * Validates all required variables are present
 */
export function loadVoiceConfig(): VoiceConfig {
  validateVoiceConfig();

  return {
    livekit: {
      url: process.env.LIVEKIT_URL!,
      apiKey: process.env.LIVEKIT_API_KEY!,
      apiSecret: process.env.LIVEKIT_API_SECRET!
    },
    stt: {
      provider: process.env.STT_PROVIDER as 'deepgram' | 'google' | 'whisper',
      apiKey: process.env.DEEPGRAM_API_KEY || ''
    },
    tts: {
      provider: process.env.TTS_PROVIDER as 'elevenlabs' | 'google' | 'openai',
      apiKey: process.env.ELEVENLABS_API_KEY || ''
    },
    tokenGenerator: {
      url: process.env.TOKEN_GENERATOR_URL!
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info'
    }
  };
}
