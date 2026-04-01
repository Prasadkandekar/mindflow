"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  AgentState,
  DisconnectButton,
} from "@livekit/components-react";
import { useCallback, useEffect, useState } from "react";
import { MediaDeviceFailure } from "livekit-client";
import type { ConnectionDetails } from "@/app/api/connection-details/route";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import { useSession } from "@/lib/contexts/session-context";
import { useRouter } from "next/navigation";
import { Mic, Phone, PhoneOff, UserCircle } from "lucide-react";
import type { Therapist } from "@/components/therapy/therapist-selection-modal";
import { TherapistSelectionModal } from "@/components/therapy/therapist-selection-modal";
import { Button } from "@/components/ui/button";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import { useDataStreamTranscriptions } from "@/hooks/useDataStreamTranscriptions";

export default function Home() {
  const { user, isAuthenticated, loading } = useSession();
  const router = useRouter();
  const [connectionDetails, updateConnectionDetails] = useState<
    ConnectionDetails | undefined
  >(undefined);
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showTherapistModal, setShowTherapistModal] = useState(false);
  
  // Voice session management
  const {
    currentSession,
    sessionContext,
    startSession,
    addTranscript,
    endSession,
  } = useVoiceSession();

  // Load selected therapist from localStorage
  useEffect(() => {
    const therapistData = localStorage.getItem('selectedTherapist');
    if (therapistData) {
      setSelectedTherapist(JSON.parse(therapistData));
    }
  }, []);

  const handleTherapistSelected = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    localStorage.setItem('selectedTherapist', JSON.stringify(therapist));
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  const onConnectButtonClicked = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    if (!selectedTherapist) {
      setError("Please select a therapist first");
      setShowTherapistModal(true);
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const url = new URL(
        process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ??
          "/api/connection-details",
        window.location.origin
      );

      const userName = user.name || user.email;
      const userId = user._id;
      const agentId = `agent_${userId}_${Date.now()}`;
      const sessionId = `session_${userId}_${Date.now()}`;

      const token = localStorage.getItem("token");
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, agentId, userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to connect: ${response.statusText}`);
      }

      const connectionDetailsData = await response.json();
      
      // Start voice session and get context from previous sessions
      const sessionResult = await startSession({
        sessionId,
        therapistId: selectedTherapist.id,
        therapistName: selectedTherapist.name,
        roomName: connectionDetailsData.roomName,
        metadata: {
          agentId,
          userName,
        },
      });

      console.log("[VoiceAgent] Session context loaded:", sessionResult.context);
      
      updateConnectionDetails(connectionDetailsData);
    } catch (err) {
      console.error("Connection error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setIsConnecting(false);
    }
  }, [user, selectedTherapist, startSession]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      <div className="container mx-auto px-4 py-6 min-h-[calc(100vh-5rem)] flex flex-col max-w-5xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Voice Therapy Session
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {selectedTherapist 
                ? `Session with ${selectedTherapist.name}`
                : "Connect with your AI therapist"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedTherapist ? (
              <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700 shadow-sm">
                <img
                  src={selectedTherapist.avatar}
                  alt={selectedTherapist.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedTherapist.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedTherapist.specialty}
                  </p>
                </div>
              </div>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTherapistModal(true)}
              disabled={agentState !== "disconnected"}
              className="flex items-center gap-2"
            >
              <UserCircle className="w-4 h-4" />
              {selectedTherapist ? "Change" : "Select"} Therapist
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center pb-8">
          <LiveKitRoom
            token={connectionDetails?.participantToken}
            serverUrl={connectionDetails?.serverUrl}
            connect={connectionDetails !== undefined}
            audio={true}
            video={false}
            onMediaDeviceFailure={onDeviceFailure}
            onDisconnected={() => {
              updateConnectionDetails(undefined);
            }}
            className="w-full"
          >
            <div className="flex flex-col items-center justify-center gap-12">
              <VoiceAssistant
                onStateChange={setAgentState}
                agentState={agentState}
                therapist={selectedTherapist}
              />
              <ControlBar
                onConnectButtonClicked={onConnectButtonClicked}
                agentState={agentState}
                isConnecting={isConnecting}
                error={error}
                userName={user?.name || user?.email || "User"}
                onDisconnect={async () => {
                  if (currentSession) {
                    try {
                      await endSession();
                      console.log("[VoiceAgent] Session ended successfully");
                    } catch (err) {
                      console.error("[VoiceAgent] Error ending session:", err);
                    }
                  }
                  updateConnectionDetails(undefined);
                }}
              />
            </div>
            <TranscriptLogger
              sessionId={currentSession?.sessionId}
              onTranscript={addTranscript}
            />
            <RoomAudioRenderer />
            <NoAgentNotification state={agentState} />
          </LiveKitRoom>
        </div>
      </div>

      <TherapistSelectionModal
        open={showTherapistModal}
        onOpenChange={setShowTherapistModal}
        onSelectTherapist={handleTherapistSelected}
      />
    </main>
  );
}

function VoiceAssistant(props: {
  onStateChange: (state: AgentState) => void;
  agentState: AgentState;
  therapist: Therapist | null;
}) {
  const { state, audioTrack } = useVoiceAssistant();

  useEffect(() => {
    props.onStateChange(state);
  }, [props, state]);

  const isActive =
    state === "listening" || state === "speaking" || state === "thinking";
  const isSpeaking = state === "speaking";

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.div
        className="relative"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full bg-purple-500/20 blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        <motion.div
          className="relative w-48 h-48 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg overflow-hidden"
          animate={{
            scale: isSpeaking ? [1, 1.02, 1] : 1,
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {props.therapist ? (
            <img
              src={props.therapist.avatar}
              alt={props.therapist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Mic className="w-16 h-16 text-white" strokeWidth={1.5} />
          )}
        </motion.div>

        {isActive && (
          <motion.div
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BarVisualizer
              state={state}
              barCount={5}
              trackRef={audioTrack}
              className="audio-bars"
              options={{ minHeight: 2, maxHeight: 32 }}
            />
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="text-center"
        >
          {state === "disconnected" && (
            <p className="text-gray-500 dark:text-gray-400">Ready to connect</p>
          )}
          {state === "connecting" && (
            <p className="text-purple-600 dark:text-purple-400 font-medium">
              Connecting...
            </p>
          )}
          {state === "listening" && (
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              Listening
            </p>
          )}
          {state === "thinking" && (
            <p className="text-amber-600 dark:text-amber-400 font-medium">
              Processing...
            </p>
          )}
          {state === "speaking" && (
            <p className="text-green-600 dark:text-green-400 font-medium">
              Speaking
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ControlBar(props: {
  onConnectButtonClicked: () => void;
  agentState: AgentState;
  isConnecting: boolean;
  error: string | null;
  userName: string;
  onDisconnect: () => void;
}) {
  const krisp = useKrispNoiseFilter();
  useEffect(() => {
    krisp.setNoiseFilterEnabled(true);
  }, []);

  const isConnected =
    props.agentState !== "disconnected" && props.agentState !== "connecting";

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        {props.agentState === "disconnected" && (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <button
              onClick={() => props.onConnectButtonClicked()}
              disabled={props.isConnecting}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {props.isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  Start Session
                </>
              )}
            </button>

            {props.error && (
              <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {props.error}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {isConnected && (
          <motion.div
            key="connected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex items-center justify-center gap-6 bg-gray-800 dark:bg-gray-800 rounded-full px-8 py-4">
              <div className="lk-controls-wrapper">
                <VoiceAssistantControlBar controls={{ leave: false }} />
              </div>
              <div className="h-14 w-px bg-gray-600" />
              <DisconnectButton>
                <button
                  onClick={props.onDisconnect}
                  className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors flex items-center justify-center"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
              </DisconnectButton>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Session active
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert(
    "Error acquiring microphone permissions. Please grant permissions and reload."
  );
}

// Component to log transcripts from the voice session
function TranscriptLogger(props: {
  sessionId?: string;
  onTranscript: (transcript: { speaker: "user" | "agent"; text: string }) => void;
}) {
  const transcriptions = useDataStreamTranscriptions();

  useEffect(() => {
    if (!props.sessionId || transcriptions.length === 0) return;

    // Log the latest transcription
    const latest = transcriptions[transcriptions.length - 1];
    if (latest && latest.text) {
      props.onTranscript({
        speaker: latest.participant?.identity?.includes("agent") ? "agent" : "user",
        text: latest.text,
      });
    }
  }, [transcriptions, props.sessionId, props.onTranscript]);

  return null; // This component doesn't render anything
}
