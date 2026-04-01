import { useState, useCallback, useEffect } from "react";
import {
  createVoiceSession,
  addTranscriptToSession,
  endVoiceSession,
  getVoiceSession,
  getUserVoiceSessions,
  getPreviousSessionsContext,
  type VoiceSession,
  type VoiceTranscript,
  type SessionSummary,
} from "@/lib/api/voiceSession";

export function useVoiceSession() {
  const [currentSession, setCurrentSession] = useState<Partial<VoiceSession> | null>(null);
  const [sessionContext, setSessionContext] = useState<string>("");
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Start a new voice therapy session
   */
  const startSession = useCallback(
    async (data: {
      sessionId: string;
      therapistId: string;
      therapistName: string;
      roomName: string;
      metadata?: any;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await createVoiceSession(data);
        setCurrentSession(result.session);
        setSessionContext(result.context);
        
        console.log("[useVoiceSession] Session started:", result.session.sessionId);
        console.log("[useVoiceSession] Context loaded:", result.context.substring(0, 100) + "...");
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to start session";
        setError(errorMessage);
        console.error("[useVoiceSession] Error starting session:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Add a transcript entry to the current session
   */
  const addTranscript = useCallback(
    async (transcript: Omit<VoiceTranscript, "timestamp">) => {
      if (!currentSession?.sessionId) {
        throw new Error("No active session");
      }

      try {
        await addTranscriptToSession(currentSession.sessionId, transcript);
        console.log("[useVoiceSession] Transcript added:", transcript.speaker, transcript.text.substring(0, 50));
      } catch (err) {
        console.error("[useVoiceSession] Error adding transcript:", err);
        throw err;
      }
    },
    [currentSession]
  );

  /**
   * End the current session
   */
  const endSession = useCallback(
    async (summary?: SessionSummary) => {
      if (!currentSession?.sessionId) {
        throw new Error("No active session");
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await endVoiceSession(currentSession.sessionId, summary);
        console.log("[useVoiceSession] Session ended:", result.session);
        setCurrentSession(null);
        setSessionContext("");
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to end session";
        setError(errorMessage);
        console.error("[useVoiceSession] Error ending session:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession]
  );

  /**
   * Load a specific session
   */
  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await getVoiceSession(sessionId);
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load session";
      setError(errorMessage);
      console.error("[useVoiceSession] Error loading session:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load all sessions for the user
   */
  const loadUserSessions = useCallback(async (limit: number = 50) => {
    setIsLoading(true);
    setError(null);

    try {
      const userSessions = await getUserVoiceSessions(limit);
      setSessions(userSessions);
      return userSessions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load sessions";
      setError(errorMessage);
      console.error("[useVoiceSession] Error loading sessions:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load previous sessions context
   */
  const loadPreviousContext = useCallback(async (numberOfSessions: number = 5) => {
    try {
      const context = await getPreviousSessionsContext(numberOfSessions);
      setSessionContext(context);
      return context;
    } catch (err) {
      console.error("[useVoiceSession] Error loading context:", err);
      throw err;
    }
  }, []);

  return {
    currentSession,
    sessionContext,
    sessions,
    isLoading,
    error,
    startSession,
    addTranscript,
    endSession,
    loadSession,
    loadUserSessions,
    loadPreviousContext,
  };
}
