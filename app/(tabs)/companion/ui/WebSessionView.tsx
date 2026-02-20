/**
 * WebSessionView.tsx
 *
 * Web AI voice companion using `livekit-client` (browser native WebRTC).
 *
 * KEY: room.connect() and room.startAudio() MUST both be called inside
 * a user gesture handler (button click). The browser's autoplay policy
 * blocks audio if startAudio() is called from a useEffect / async callback.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ConnectionState, RemoteAudioTrack, Room, RoomEvent, Track } from 'livekit-client';

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionPhase = 'idle' | 'connecting' | 'connected' | 'error';

type Message = {
  id: string;
  text: string;
  from: 'user' | 'agent';
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function WebSessionView() {
  const { token, url } = useLocalSearchParams<{ token: string; url: string }>();
  const router = useRouter();

  const serverUrl = (url as string) || 'wss://mental-wellness-3z07873b.livekit.cloud';

  const [phase, setPhase] = useState<SessionPhase>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  // ─── Animations ─────────────────────────────────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (phase !== 'connected') return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.09, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const ripple = Animated.loop(
      Animated.sequence([
        Animated.timing(rippleAnim, { toValue: 1, duration: 2400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(rippleAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    pulse.start();
    ripple.start();
    return () => { pulse.stop(); ripple.stop(); };
  }, [phase]);

  // ─── Message helpers ──────────────────────────────────────────────────────
  const upsertMessage = useCallback((id: string, text: string, from: 'user' | 'agent') => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], text };
        return next;
      }
      return [{ id, text, from }, ...prev];
    });
  }, []);

  // ─── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, []);

  // ─── START SESSION (must be called from a button click — user gesture) ─────
  const onStartSession = useCallback(async () => {
    if (!token) {
      setErrorMsg('No token available. Please go back and try again.');
      setPhase('error');
      return;
    }

    setPhase('connecting');
    setErrorMsg('');

    const room = new Room({
      audioCaptureDefaults: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      adaptiveStream: true,
      dynacast: true,
    });
    roomRef.current = room;

    // ── Audio playback status: browser may still block after startAudio
    room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
      setNeedsAudioUnlock(!room.canPlaybackAudio);
    });

    // ── Remote audio track: explicitly attach to DOM so the browser plays it.
    // livekit-client creates the AudioContext internally, but the <audio> element
    // must be appended to document.body for browser autoplay to work reliably.
    room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
      console.log('[LiveKit web] Track subscribed:', track.kind, 'from', participant.identity);
      if (track.kind === Track.Kind.Audio) {
        const audioEl = (track as RemoteAudioTrack).attach();
        audioEl.style.display = 'none';
        audioEl.setAttribute('data-livekit', 'remote-audio');
        document.body.appendChild(audioEl);
        audioEl.play().catch((err) => {
          console.warn('[LiveKit web] Autoplay blocked, showing unlock button:', err);
          setNeedsAudioUnlock(true);
        });
      }
    });

    // ── Cleanup audio elements when track is removed
    room.on(RoomEvent.TrackUnsubscribed, (track) => {
      if (track.kind === Track.Kind.Audio) {
        (track as RemoteAudioTrack).detach().forEach((el) => el.remove());
      }
    });

    // ── Agent transcription via LiveKit text streams
    room.registerTextStreamHandler('lk.transcription', async (reader: any, participantInfo: any) => {
      const attributes = reader.info?.attributes ?? {};
      const segmentId = attributes['lk.segment_id'] ?? `agent-${Date.now()}`;
      let text = '';
      for await (const chunk of reader) {
        text += chunk;
        upsertMessage(segmentId, text, 'agent');
      }
    });

    try {
      // ── CRITICAL: startAudio() BEFORE connect() — we are still inside
      // the click handler (user gesture context) here.
      await room.startAudio();

      // ── Connect
      await room.connect(serverUrl, token as string);

      // ── Enable microphone
      await room.localParticipant.setMicrophoneEnabled(true);
      setIsMicEnabled(true);
      setNeedsAudioUnlock(false);
      setPhase('connected');
    } catch (err: any) {
      console.error('[LiveKit web] Connection error:', err);
      setErrorMsg(err?.message ?? 'Failed to connect. Please try again.');
      setPhase('error');
      room.disconnect();
      roomRef.current = null;
    }
  }, [token, serverUrl, upsertMessage]);

  // ─── Controls ────────────────────────────────────────────────────────────
  const onUnlockAudio = useCallback(async () => {
    // Called from a button click — valid user gesture.
    // 1. Resume the AudioContext via LiveKit
    await roomRef.current?.startAudio();
    // 2. Also explicitly play all attached audio elements
    document.querySelectorAll<HTMLAudioElement>('audio[data-livekit="remote-audio"]').forEach((el) => {
      el.play().catch(console.error);
    });
    setNeedsAudioUnlock(false);
  }, []);

  const onToggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !isMicEnabled;
    await room.localParticipant.setMicrophoneEnabled(next);
    setIsMicEnabled(next);
  }, [isMicEnabled]);

  const onSendChat = useCallback(async () => {
    const text = chatInput.trim();
    if (!text) return;
    const room = roomRef.current;
    if (room?.state === ConnectionState.Connected) {
      await room.localParticipant.sendText(text, { topic: 'lk.chat' });
    }
    upsertMessage(`user-${Date.now()}`, text, 'user');
    setChatInput('');
  }, [chatInput, upsertMessage]);

  const onExit = useCallback(() => {
    roomRef.current?.disconnect();
    roomRef.current = null;
    router.back();
  }, [router]);

  const rippleScale = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const rippleOpacity = rippleAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.35, 0.1, 0] });

  // ─── Render: IDLE (pre-connect landing) ──────────────────────────────────
  if (phase === 'idle' || phase === 'error') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.idleContainer, { opacity: fadeAnim }]}>
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#8B6251" />
          </TouchableOpacity>

          {/* Avatar */}
          <View style={styles.idleOrbRing}>
            <View style={styles.idleOrb}>
              <Text style={styles.idleEmoji}>🌙</Text>
            </View>
          </View>

          <Text style={styles.idleTitle}>Meet Mendy</Text>
          <Text style={styles.idleSubtitle}>
            Your AI mental wellness companion.{'\n'}
            Talk freely — Mendy listens without judgment.
          </Text>

          {phase === 'error' && (
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={18} color="#FF3B30" />
              <Text style={styles.errorText}> {errorMsg}</Text>
            </View>
          )}

          {/* ── THE CRITICAL BUTTON: everything starts here (user gesture) */}
          <TouchableOpacity
            style={styles.startBtn}
            onPress={onStartSession}
            activeOpacity={0.85}
          >
            <Ionicons name="mic" size={20} color="#FFFFFF" />
            <Text style={styles.startBtnText}>
              {phase === 'error' ? 'Try Again' : 'Start Session'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.idleHint}>
            🔊 Make sure your speaker volume is turned up
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ─── Render: CONNECTING ───────────────────────────────────────────────────
  if (phase === 'connecting') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.connectingContainer}>
          <View style={styles.idleOrbRing}>
            <Animated.View style={[styles.idleOrb, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.idleEmoji}>🌙</Text>
            </Animated.View>
          </View>
          <Text style={styles.connectingText}>Connecting to Mendy…</Text>
          <Text style={styles.connectingSubtext}>Setting up your secure session</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: CONNECTED (main session UI) ──────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.sessionContainer}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={onExit} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color="#FF7B1B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mendy</Text>
          <View style={styles.liveChip}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* Audio unlock banner */}
        {needsAudioUnlock && (
          <TouchableOpacity style={styles.unlockBanner} onPress={onUnlockAudio} activeOpacity={0.85}>
            <Ionicons name="volume-high" size={18} color="#fff" />
            <Text style={styles.unlockText}>  Tap to enable voice output</Text>
          </TouchableOpacity>
        )}

        {/* Orb */}
        <View style={styles.orbArea}>
          <Animated.View style={[styles.ripple, { transform: [{ scale: rippleScale }], opacity: rippleOpacity }]} />
          <Animated.View style={[styles.orb, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.orbInner}>
              <Text style={styles.orbEmoji}>🌙</Text>
            </View>
          </Animated.View>
          <Text style={styles.orbSubtitle}>
            {needsAudioUnlock ? '🔊 Tap above to hear Mendy' : isMicEnabled ? 'Listening…' : 'Mic muted'}
          </Text>
        </View>

        {/* Chat log */}
        {isChatVisible && (
          <ScrollView ref={scrollRef} style={styles.chatLog} contentContainerStyle={styles.chatContent}>
            {messages.map((msg) => (
              <View key={msg.id} style={[styles.bubble, msg.from === 'user' ? styles.userBubble : styles.agentBubble]}>
                <Text style={[styles.bubbleText, msg.from === 'user' ? styles.userText : styles.agentText]}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Chat input */}
        {isChatVisible && (
          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Type a message…"
              placeholderTextColor="#9E8074"
              onSubmitEditing={onSendChat}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={onSendChat} activeOpacity={0.8}>
              <Ionicons name="arrow-up" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Control bar */}
        <View style={styles.ctrlBar}>
          <TouchableOpacity
            style={[styles.ctrlBtn, isMicEnabled && styles.ctrlActive]}
            onPress={onToggleMic}
            activeOpacity={0.7}
          >
            <Ionicons name={isMicEnabled ? 'mic' : 'mic-off'} size={22} color={isMicEnabled ? '#FF7B1B' : '#8B6251'} />
          </TouchableOpacity>

          {needsAudioUnlock && (
            <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlActive]} onPress={onUnlockAudio} activeOpacity={0.7}>
              <Ionicons name="volume-high" size={22} color="#FF7B1B" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.ctrlBtn, isChatVisible && styles.ctrlActive]}
            onPress={() => setIsChatVisible((v) => !v)}
            activeOpacity={0.7}
          >
            <Ionicons name={isChatVisible ? 'chatbubble' : 'chatbubble-outline'} size={22} color={isChatVisible ? '#FF7B1B' : '#8B6251'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.ctrlBtn, styles.endBtn]} onPress={onExit} activeOpacity={0.7}>
            <Ionicons name="call" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF0EA' },

  // Idle / pre-connect
  idleContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  backBtn: { position: 'absolute', top: 16, left: 16, padding: 8 },
  idleOrbRing: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#FF7B1B18',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 32,
  },
  idleOrb: {
    width: 130, height: 130, borderRadius: 65, backgroundColor: '#FF7B1B',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF7B1B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  idleEmoji: { fontSize: 60 },
  idleTitle: { fontSize: 28, fontWeight: '800', color: '#2D1E17', marginBottom: 12, textAlign: 'center' },
  idleSubtitle: { fontSize: 16, color: '#8B6251', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FF3B3015', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: { color: '#FF3B30', fontSize: 14, fontWeight: '500' },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FF7B1B',
    paddingHorizontal: 36, paddingVertical: 16,
    borderRadius: 32,
    shadowColor: '#FF7B1B', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
    marginBottom: 24,
  },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  idleHint: { fontSize: 13, color: '#9E8074', textAlign: 'center' },

  // Connecting
  connectingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  connectingText: { fontSize: 20, fontWeight: '700', color: '#2D1E17', marginTop: 32 },
  connectingSubtext: { fontSize: 14, color: '#8B6251', marginTop: 8 },

  // Session
  sessionContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 20 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: 16 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF7B1B18', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '700', color: '#2D1E17' },
  liveChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF3B3018', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF3B30', marginRight: 5 },
  liveText: { fontSize: 11, fontWeight: '800', color: '#FF3B30', letterSpacing: 0.5 },

  // Unlock banner
  unlockBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FF7B1B', borderRadius: 14,
    paddingHorizontal: 18, paddingVertical: 12,
    marginBottom: 8, width: '100%',
  },
  unlockText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  // Orb
  orbArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ripple: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#FF7B1B' },
  orb: {
    width: 180, height: 180, borderRadius: 90, backgroundColor: '#FF7B1B',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF7B1B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 24, elevation: 16,
  },
  orbInner: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#FF9040', alignItems: 'center', justifyContent: 'center' },
  orbEmoji: { fontSize: 64 },
  orbSubtitle: { marginTop: 24, fontSize: 16, color: '#8B6251', fontWeight: '500' },

  // Chat
  chatLog: { width: '100%', maxHeight: 200, marginBottom: 8 },
  chatContent: { flexDirection: 'column-reverse', paddingHorizontal: 4 },
  bubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, marginVertical: 3 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#3D2E27' },
  agentBubble: { alignSelf: 'flex-start', backgroundColor: '#F0E4D8' },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  userText: { color: '#fff' },
  agentText: { color: '#2D1E17' },

  chatInputRow: { flexDirection: 'row', width: '100%', backgroundColor: '#2D1E17', borderRadius: 24, padding: 8, marginBottom: 12, alignItems: 'center' },
  chatInput: { flex: 1, color: '#fff', fontSize: 15, paddingHorizontal: 8, minHeight: 32 },
  sendBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF7B1B', alignItems: 'center', justifyContent: 'center' },

  // Controls
  ctrlBar: { flexDirection: 'row', gap: 12, paddingBottom: 24, paddingTop: 8 },
  ctrlBtn: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#F0E4D8',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  ctrlActive: { backgroundColor: '#FF7B1B18' },
  endBtn: { backgroundColor: '#FF3B30' },
});
