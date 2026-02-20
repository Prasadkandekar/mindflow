import { Platform } from 'react-native';
import { useCallback, useEffect, useState } from 'react';

// Types are safe to import - they're erased at runtime
import type { TranscriptionSegment } from 'livekit-client';

export type Transcription = {
    identity: string;
    segment: TranscriptionSegment;
};

export type TranscriptionsState = {
    transcriptions: Transcription[];
    addTranscription: (identity: string, message: string) => void;
};

// ─── Web stub ─────────────────────────────────────────────────────────────────
// On web, LiveKit native packages are unavailable. Return a no-op state.
function useDataStreamTranscriptionsWeb(): TranscriptionsState {
    const [transcriptions] = useState<Transcription[]>([]);
    const addTranscription = useCallback(() => { }, []);
    return { transcriptions, addTranscription };
}

// ─── Native implementation ────────────────────────────────────────────────────
function useDataStreamTranscriptionsNative(): TranscriptionsState {
    const { useRoomContext, useVoiceAssistant } = require('@livekit/components-react');
    const { TextStreamReader } = require('livekit-client');

    const room = useRoomContext();
    const { agent } = useVoiceAssistant();
    const agentIdentity = agent?.identity;

    const [transcriptionMap] = useState<Map<string, Transcription>>(new Map());
    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);

    const mergeTranscriptions = useCallback(
        (merge: Transcription[]) => {
            for (const transcription of merge) {
                const existing = transcriptionMap.get(transcription.segment.id);
                transcriptionMap.set(transcription.segment.id, {
                    identity: transcription.identity,
                    segment: mergeTranscriptionSegment(existing?.segment, transcription.segment),
                });
            }

            const sortedTranscriptions = Array.from(transcriptionMap.values()).sort(
                (a, b) => b.segment.firstReceivedTime - a.segment.firstReceivedTime
            );

            setTranscriptions(sortedTranscriptions);
        },
        [transcriptionMap, setTranscriptions]
    );

    const addTranscription = useCallback(
        (identity: string, message: string) => {
            const now = Date.now();
            const newTranscription: Transcription = {
                identity,
                segment: {
                    id: crypto.randomUUID(),
                    text: message,
                    language: '',
                    startTime: now,
                    endTime: now,
                    final: true,
                    firstReceivedTime: now,
                    lastReceivedTime: now,
                },
            };
            mergeTranscriptions([newTranscription]);

            // Send message to agent
            if (agentIdentity) {
                room.localParticipant.sendText(message, {
                    topic: 'lk.chat',
                    destinationIdentities: [agentIdentity],
                });
            }
        },
        [mergeTranscriptions, agentIdentity, room]
    );

    useEffect(() => {
        room.registerTextStreamHandler(
            'lk.transcription',
            (reader: any, participantInfo: { identity: string }) => {
                const segment = createTranscriptionSegment(reader.info.attributes);
                let text = '';

                const readFunc = async () => {
                    for await (const chunk of reader) {
                        text += chunk;
                        const updatedSegment = { ...segment, text, lastReceivedTime: Date.now() };
                        mergeTranscriptions([{ identity: participantInfo.identity, segment: updatedSegment }]);
                    }
                    const finalSegment = { ...segment, text, final: true };
                    mergeTranscriptions([{ identity: participantInfo.identity, segment: finalSegment }]);
                };

                readFunc();
            }
        );

        return () => {
            room.unregisterTextStreamHandler('lk.transcription');
        };
    }, [room]);

    return { transcriptions, addTranscription };
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function useDataStreamTranscriptions(): TranscriptionsState {
    if (Platform.OS === 'web') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useDataStreamTranscriptionsWeb();
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useDataStreamTranscriptionsNative();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const createTranscriptionSegment = (
    attributes?: Record<string, string>
): TranscriptionSegment => {
    const now = Date.now();
    return {
        id: attributes?.['lk.segment_id'] ?? '',
        text: '',
        language: '',
        startTime: now,
        endTime: now,
        final: (attributes?.['lk.transcription.final'] ?? false) === 'true',
        firstReceivedTime: now,
        lastReceivedTime: now,
    };
};

const mergeTranscriptionSegment = (
    existing: TranscriptionSegment | undefined,
    newSegment: TranscriptionSegment
): TranscriptionSegment => {
    if (!existing) return newSegment;
    if (existing.id !== newSegment.id) return existing;
    return {
        ...existing,
        text: newSegment.text,
        language: newSegment.language,
        final: newSegment.final,
        endTime: newSegment.endTime,
        lastReceivedTime: newSegment.lastReceivedTime,
    };
};
