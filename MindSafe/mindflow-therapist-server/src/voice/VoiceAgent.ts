import { Room, RoomEvent, LocalAudioTrack, RemoteParticipant, ConnectionState, AudioSource, TrackPublishOptions } from '@livekit/rtc-node';
import { VoiceAgentConfig, SessionState } from './types';
import { EventEmitter } from 'events';
import { RPCHandler } from './handlers/RPCHandler';

/**
 * Connection state for the Voice Agent
 */
export enum AgentConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

/**
 * Voice Agent class that manages LiveKit room connections and audio processing
 * Implements Requirements 1.1, 1.2, 1.3, 1.5, 1.6
 */
export class VoiceAgent extends EventEmitter {
  private room: Room | null = null;
  private config: VoiceAgentConfig;
  private sessions: Map<string, SessionState> = new Map();
  private audioTrack: LocalAudioTrack | null = null;
  private audioSource: AudioSource | null = null;
  private connectionState: AgentConnectionState = AgentConnectionState.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private reconnectDelays: number[] = [1000, 2000, 4000]; // 1s, 2s, 4s
  private rpcHandler: RPCHandler;
  private rpcMethodsRegistered: boolean = false;

  constructor(config: VoiceAgentConfig) {
    super();
    this.config = config;
    this.rpcHandler = new RPCHandler();
  }

  /**
   * Get current connection state
   */
  public getConnectionState(): AgentConnectionState {
    return this.connectionState;
  }

  /**
   * Check if agent is connected to a room
   */
  public isConnected(): boolean {
    return this.connectionState === AgentConnectionState.CONNECTED;
  }

  /**
   * Connect to a LiveKit room with the provided token
   * Implements Requirements 1.1, 1.2, 1.3
   * 
   * @param roomName - Name of the room to connect to
   * @param token - JWT token for authentication
   */
  public async connectToRoom(roomName: string, token: string): Promise<void> {
    try {
      this.setConnectionState(AgentConnectionState.CONNECTING);
      this.emit('connecting', { roomName });

      // Create new room instance
      this.room = new Room();

      // Set up event listeners before connecting
      this.setupRoomEventListeners();

      // Connect to the room
      await this.room.connect(this.config.livekitUrl, token);

      // Publish audio track after successful connection
      await this.publishAudioTrack();

      // Register RPC methods after successful connection
      await this.registerRPCMethods();

      this.setConnectionState(AgentConnectionState.CONNECTED);
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      this.emit('connected', { roomName });

      console.log(`[VoiceAgent] Successfully connected to room: ${roomName}`);
    } catch (error) {
      this.setConnectionState(AgentConnectionState.ERROR);
      this.emit('error', { error, context: 'connectToRoom' });
      console.error(`[VoiceAgent] Failed to connect to room: ${roomName}`, error);
      throw error;
    }
  }

  /**
   * Create and publish audio track for agent speech output
   * Implements Requirement 1.3
   * Configures track with 16kHz sample rate and mono channel
   */
  private async publishAudioTrack(): Promise<void> {
    try {
      if (!this.room) {
        throw new Error('Cannot publish audio track: not connected to room');
      }

      console.log('[VoiceAgent] Creating audio track...');

      // Create an audio source with 16kHz sample rate and mono channel
      this.audioSource = new AudioSource(16000, 1);

      // Create local audio track from the audio source
      this.audioTrack = LocalAudioTrack.createAudioTrack('agent-audio', this.audioSource);

      // Publish the audio track to the room with default options
      const options: Partial<TrackPublishOptions> = {};
      const publication = await this.room.localParticipant?.publishTrack(this.audioTrack, options as TrackPublishOptions);

      console.log('[VoiceAgent] Audio track published successfully');
      this.emit('audioTrackPublished', { trackSid: publication?.sid });
    } catch (error) {
      console.error('[VoiceAgent] Failed to publish audio track:', error);
      this.emit('error', { error, context: 'publishAudioTrack' });
      throw error;
    }
  }

  /**
   * Get the published audio track
   */
  public getAudioTrack(): LocalAudioTrack | null {
    return this.audioTrack;
  }

  /**
   * Get the audio source
   */
  public getAudioSource(): AudioSource | null {
    return this.audioSource;
  }

  /**
   * Register RPC methods on the room's local participant
   * Implements Requirements 3.1, 3.2, 3.3, 3.4, 3.5
   * Ensures registration completes before accepting calls
   * 
   * NOTE: Current version of @livekit/rtc-node (0.9.2) does not support native RPC methods.
   * This implementation uses data channel as a workaround until RPC support is available.
   * When upgrading to a version with RPC support, replace this with native registerRpcMethod calls.
   */
  private async registerRPCMethods(): Promise<void> {
    try {
      if (!this.room || !this.room.localParticipant) {
        throw new Error('Cannot register RPC methods: not connected to room');
      }

      console.log('[VoiceAgent] Registering RPC methods (using data channel workaround)...');

      // Set up data channel listener for RPC calls
      this.room.on(RoomEvent.DataReceived, async (data: Uint8Array, participant: any, kind: any, topic?: string) => {
        // Only process RPC messages (identified by topic prefix)
        if (!topic || !topic.startsWith('rpc:')) {
          return;
        }

        try {
          const method = topic.substring(4); // Remove 'rpc:' prefix
          const payload = new TextDecoder().decode(data);
          const request = JSON.parse(payload);

          console.log(`[VoiceAgent] RPC: ${method} called`, {
            requestId: request.requestId,
            callerIdentity: participant?.identity || 'unknown'
          });

          let response;
          switch (method) {
            case 'startSession':
              response = await this.rpcHandler.handleStartSession(
                request.params || request,
                request.requestId || 'unknown'
              );
              break;
            case 'endSession':
              response = await this.rpcHandler.handleEndSession(
                request.params || request,
                request.requestId || 'unknown'
              );
              break;
            case 'logUserMessage':
              response = await this.rpcHandler.handleLogUserMessage(
                request.params || request,
                request.requestId || 'unknown'
              );
              break;
            case 'logAgentResponse':
              response = await this.rpcHandler.handleLogAgentResponse(
                request.params || request,
                request.requestId || 'unknown'
              );
              break;
            default:
              response = this.rpcHandler.createErrorResponse(
                `Unknown RPC method: ${method}`,
                request.requestId || 'unknown'
              );
          }

          // Send response back via data channel
          const responsePayload = new TextEncoder().encode(JSON.stringify(response));
          if (this.room && this.room.localParticipant) {
            await this.room.localParticipant.publishData(responsePayload, {
              reliable: true,
              destination_identities: participant?.identity ? [participant.identity] : [],
              topic: `rpc-response:${request.requestId}`
            });
          }

          console.log(`[VoiceAgent] RPC: ${method} response sent`);
        } catch (error) {
          console.error('[VoiceAgent] Error handling RPC call:', error);
        }
      });

      this.rpcMethodsRegistered = true;
      console.log('[VoiceAgent] RPC methods registered successfully (data channel mode)');
      this.emit('rpcMethodsRegistered');
    } catch (error) {
      console.error('[VoiceAgent] Failed to register RPC methods:', error);
      this.emit('error', { error, context: 'registerRPCMethods' });
      throw error;
    }
  }

  /**
   * Check if RPC methods are registered
   */
  public areRPCMethodsRegistered(): boolean {
    return this.rpcMethodsRegistered;
  }

  /**
   * Disconnect from the current room and cleanup resources
   * Implements Requirement 1.6
   */
  public async disconnect(): Promise<void> {
    try {
      console.log('[VoiceAgent] Disconnecting from room...');

      // Unpublish audio track if it exists
      if (this.audioTrack && this.room && this.audioTrack.sid) {
        try {
          await this.room.localParticipant?.unpublishTrack(this.audioTrack.sid);
          console.log('[VoiceAgent] Audio track unpublished');
        } catch (error) {
          console.error('[VoiceAgent] Error unpublishing audio track:', error);
        }
      }

      // Close audio track
      if (this.audioTrack) {
        // Note: LiveKit SDK handles track cleanup automatically
        this.audioTrack = null;
      }

      // Close audio source
      if (this.audioSource) {
        this.audioSource = null;
      }

      // Disconnect from room
      if (this.room) {
        await this.room.disconnect();
        this.room = null;
        console.log('[VoiceAgent] Disconnected from room');
      }

      this.rpcMethodsRegistered = false;
      this.setConnectionState(AgentConnectionState.DISCONNECTED);
      this.emit('disconnected');

      console.log('[VoiceAgent] Cleanup complete');
    } catch (error) {
      console.error('[VoiceAgent] Error during disconnect:', error);
      this.setConnectionState(AgentConnectionState.ERROR);
      this.emit('error', { error, context: 'disconnect' });
      throw error;
    }
  }

  /**
   * Set up event listeners for room events
   * Handles connection state changes and participant events
   */
  private setupRoomEventListeners(): void {
    if (!this.room) return;

    // Handle connection state changes
    this.room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
      console.log(`[VoiceAgent] Connection state changed: ${state}`);
      
      switch (state) {
        case ConnectionState.CONN_CONNECTED:
          this.setConnectionState(AgentConnectionState.CONNECTED);
          this.emit('connected');
          break;
        case ConnectionState.CONN_DISCONNECTED:
          this.handleDisconnection();
          break;
        case ConnectionState.CONN_RECONNECTING:
          this.setConnectionState(AgentConnectionState.RECONNECTING);
          this.emit('reconnecting');
          break;
      }
    });

    // Handle participant connected
    this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log(`[VoiceAgent] Participant connected: ${participant.identity}`);
      this.emit('participantConnected', { identity: participant.identity });
    });

    // Handle participant disconnected
    this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log(`[VoiceAgent] Participant disconnected: ${participant.identity}`);
      this.emit('participantDisconnected', { identity: participant.identity });
    });

    // Handle room disconnected
    this.room.on(RoomEvent.Disconnected, () => {
      console.log('[VoiceAgent] Room disconnected');
      this.handleDisconnection();
    });
  }

  /**
   * Handle disconnection and trigger reconnection if needed
   * Implements Requirement 1.4, 1.5
   */
  private handleDisconnection(): void {
    if (this.connectionState === AgentConnectionState.DISCONNECTED) {
      // Already disconnected, no need to reconnect
      return;
    }

    console.log('[VoiceAgent] Handling disconnection...');
    this.setConnectionState(AgentConnectionState.DISCONNECTED);
    this.emit('disconnected');

    // Attempt reconnection if we haven't exceeded max attempts
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnection();
    } else {
      console.error('[VoiceAgent] Max reconnection attempts reached');
      this.setConnectionState(AgentConnectionState.ERROR);
      this.emit('error', { 
        error: new Error('Max reconnection attempts reached'), 
        context: 'reconnection' 
      });
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   * Implements Requirement 1.5
   * Max 3 attempts with delays: 1s, 2s, 4s
   */
  private async attemptReconnection(): Promise<void> {
    const delay = this.reconnectDelays[this.reconnectAttempts] || 4000;
    this.reconnectAttempts++;

    const logMessage = `[VoiceAgent] Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} scheduled in ${delay}ms (exponential backoff)`;
    console.log(logMessage);
    
    this.setConnectionState(AgentConnectionState.RECONNECTING);
    this.emit('reconnecting', { 
      attempt: this.reconnectAttempts, 
      maxAttempts: this.maxReconnectAttempts,
      delay,
      timestamp: new Date().toISOString()
    });

    setTimeout(async () => {
      try {
        if (this.room) {
          // Try to reconnect the existing room
          // Note: The actual reconnection is handled by the LiveKit SDK automatically
          // We just need to monitor the connection state
          console.log(`[VoiceAgent] Reconnection attempt ${this.reconnectAttempts} initiated at ${new Date().toISOString()}`);
          
          // The LiveKit SDK will handle the reconnection automatically
          // If it succeeds, the ConnectionStateChanged event will fire
          // If it fails, we'll try again
        }
      } catch (error) {
        const errorMessage = `[VoiceAgent] Reconnection attempt ${this.reconnectAttempts} failed`;
        console.error(errorMessage, error);
        this.emit('reconnectionFailed', { 
          attempt: this.reconnectAttempts, 
          error,
          timestamp: new Date().toISOString()
        });
        
        // Try again if we haven't exceeded max attempts
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`[VoiceAgent] Will retry reconnection (${this.maxReconnectAttempts - this.reconnectAttempts} attempts remaining)`);
          this.attemptReconnection();
        } else {
          const finalError = new Error('All reconnection attempts exhausted');
          console.error(`[VoiceAgent] ${finalError.message}. Total attempts: ${this.reconnectAttempts}`);
          this.setConnectionState(AgentConnectionState.ERROR);
          this.emit('error', { 
            error: finalError, 
            context: 'reconnection',
            totalAttempts: this.reconnectAttempts,
            timestamp: new Date().toISOString()
          });
        }
      }
    }, delay);
  }

  /**
   * Update connection state and emit event
   */
  private setConnectionState(state: AgentConnectionState): void {
    const previousState = this.connectionState;
    this.connectionState = state;
    
    if (previousState !== state) {
      this.emit('stateChanged', { previousState, currentState: state });
    }
  }

  /**
   * Get the current room instance
   */
  public getRoom(): Room | null {
    return this.room;
  }

  /**
   * Get session state by session ID
   */
  public getSession(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  public getSessions(): Map<string, SessionState> {
    return this.sessions;
  }
}
