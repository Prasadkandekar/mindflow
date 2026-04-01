import { VoiceAgent, AgentConnectionState } from '../src/voice/VoiceAgent';
import { VoiceAgentConfig } from '../src/voice/types';

describe('VoiceAgent', () => {
  let agent: VoiceAgent;
  let config: VoiceAgentConfig;

  beforeEach(() => {
    config = {
      livekitUrl: 'ws://localhost:7880',
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      backendUrl: 'http://localhost:3000',
      sttProvider: 'deepgram',
      ttsProvider: 'elevenlabs'
    };
    agent = new VoiceAgent(config);
  });

  afterEach(async () => {
    // Cleanup
    if (agent.isConnected()) {
      await agent.disconnect();
    }
  });

  describe('constructor', () => {
    it('should create VoiceAgent instance with correct initial state', () => {
      expect(agent).toBeInstanceOf(VoiceAgent);
      expect(agent.getConnectionState()).toBe(AgentConnectionState.DISCONNECTED);
      expect(agent.isConnected()).toBe(false);
      expect(agent.getRoom()).toBeNull();
      expect(agent.getAudioTrack()).toBeNull();
      expect(agent.getAudioSource()).toBeNull();
    });
  });

  describe('connection state', () => {
    it('should track connection state changes', (done) => {
      const states: AgentConnectionState[] = [];
      
      agent.on('stateChanged', ({ currentState }) => {
        states.push(currentState);
      });

      agent.on('connecting', () => {
        expect(agent.getConnectionState()).toBe(AgentConnectionState.CONNECTING);
      });

      // Simulate state change
      agent.emit('stateChanged', { 
        previousState: AgentConnectionState.DISCONNECTED, 
        currentState: AgentConnectionState.CONNECTING 
      });

      setTimeout(() => {
        expect(states).toContain(AgentConnectionState.CONNECTING);
        done();
      }, 100);
    });
  });

  describe('session management', () => {
    it('should initialize with empty sessions map', () => {
      const sessions = agent.getSessions();
      expect(sessions).toBeInstanceOf(Map);
      expect(sessions.size).toBe(0);
    });

    it('should return undefined for non-existent session', () => {
      const session = agent.getSession('non-existent-id');
      expect(session).toBeUndefined();
    });
  });

  describe('event emitter', () => {
    it('should emit events correctly', (done) => {
      const testData = { test: 'data' };
      
      agent.on('test-event', (data) => {
        expect(data).toEqual(testData);
        done();
      });

      agent.emit('test-event', testData);
    });
  });
});
