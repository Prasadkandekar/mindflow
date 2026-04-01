import { validateVoiceConfig, loadVoiceConfig } from '../src/voice/config';

describe('Voice Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('validateVoiceConfig', () => {
    it('should throw error when required variables are missing', () => {
      // Clear all voice-related env vars
      delete process.env.LIVEKIT_URL;
      delete process.env.LIVEKIT_API_KEY;
      delete process.env.LIVEKIT_API_SECRET;
      delete process.env.STT_PROVIDER;
      delete process.env.TTS_PROVIDER;
      delete process.env.TOKEN_GENERATOR_URL;

      expect(() => validateVoiceConfig()).toThrow(/Missing required environment variables/);
    });

    it('should throw error for invalid STT provider', () => {
      process.env.LIVEKIT_URL = 'ws://localhost:7880';
      process.env.LIVEKIT_API_KEY = 'test-key';
      process.env.LIVEKIT_API_SECRET = 'test-secret';
      process.env.STT_PROVIDER = 'invalid-provider';
      process.env.TTS_PROVIDER = 'elevenlabs';
      process.env.TOKEN_GENERATOR_URL = 'http://localhost:3002';

      expect(() => validateVoiceConfig()).toThrow(/Invalid STT_PROVIDER/);
    });

    it('should throw error for invalid TTS provider', () => {
      process.env.LIVEKIT_URL = 'ws://localhost:7880';
      process.env.LIVEKIT_API_KEY = 'test-key';
      process.env.LIVEKIT_API_SECRET = 'test-secret';
      process.env.STT_PROVIDER = 'deepgram';
      process.env.TTS_PROVIDER = 'invalid-provider';
      process.env.TOKEN_GENERATOR_URL = 'http://localhost:3002';

      expect(() => validateVoiceConfig()).toThrow(/Invalid TTS_PROVIDER/);
    });

    it('should not throw error when all required variables are present', () => {
      process.env.LIVEKIT_URL = 'ws://localhost:7880';
      process.env.LIVEKIT_API_KEY = 'test-key';
      process.env.LIVEKIT_API_SECRET = 'test-secret';
      process.env.STT_PROVIDER = 'deepgram';
      process.env.TTS_PROVIDER = 'elevenlabs';
      process.env.TOKEN_GENERATOR_URL = 'http://localhost:3002';

      expect(() => validateVoiceConfig()).not.toThrow();
    });
  });

  describe('loadVoiceConfig', () => {
    it('should load configuration with all required fields', () => {
      process.env.LIVEKIT_URL = 'ws://localhost:7880';
      process.env.LIVEKIT_API_KEY = 'test-key';
      process.env.LIVEKIT_API_SECRET = 'test-secret';
      process.env.STT_PROVIDER = 'deepgram';
      process.env.TTS_PROVIDER = 'elevenlabs';
      process.env.TOKEN_GENERATOR_URL = 'http://localhost:3002';
      process.env.LOG_LEVEL = 'debug';

      const config = loadVoiceConfig();

      expect(config.livekit.url).toBe('ws://localhost:7880');
      expect(config.livekit.apiKey).toBe('test-key');
      expect(config.livekit.apiSecret).toBe('test-secret');
      expect(config.stt.provider).toBe('deepgram');
      expect(config.tts.provider).toBe('elevenlabs');
      expect(config.tokenGenerator.url).toBe('http://localhost:3002');
      expect(config.logging.level).toBe('debug');
    });

    it('should use default log level when not specified', () => {
      process.env.LIVEKIT_URL = 'ws://localhost:7880';
      process.env.LIVEKIT_API_KEY = 'test-key';
      process.env.LIVEKIT_API_SECRET = 'test-secret';
      process.env.STT_PROVIDER = 'deepgram';
      process.env.TTS_PROVIDER = 'elevenlabs';
      process.env.TOKEN_GENERATOR_URL = 'http://localhost:3002';
      delete process.env.LOG_LEVEL;

      const config = loadVoiceConfig();

      expect(config.logging.level).toBe('info');
    });
  });
});
