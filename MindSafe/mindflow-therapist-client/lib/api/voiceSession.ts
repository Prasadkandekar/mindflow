const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface VoiceTranscript {
  speaker: "user" | "agent";
  text: string;
  timestamp: Date;
  duration?: number;
  sentiment?: {
    score: number;
    label: "positive" | "neutral" | "negative";
  };
  keywords?: string[];
}

export interface SessionSummary {
  mainTopics: string[];
  emotionalState: string;
  keyInsights: string[];
  actionItems?: string[];
  riskLevel: number;
  progressNotes: string;
}

export interface VoiceSession {
  _id: string;
  sessionId: string;
  userId: string;
  therapistId: string;
  therapistName: string;
  roomName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: "active" | "completed" | "interrupted" | "archived";
  transcripts: VoiceTranscript[];
  summary?: SessionSummary;
  metadata?: any;
  contextFromPreviousSessions?: string;
}

/**
 * Create a new voice therapy session
 */
export async function createVoiceSession(data: {
  sessionId: string;
  therapistId: string;
  therapistName: string;
  roomName: string;
  metadata?: any;
}): Promise<{ session: Partial<VoiceSession>; context: string }> {
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${API_URL}/api/voice/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create voice session");
  }

  const result = await response.json();
  return {
    session: result.session,
    context: result.session.contextFromPreviousSessions || "",
  };
}

/**
 * Add a transcript entry to a session
 */
export async function addTranscriptToSession(
  sessionId: string,
  transcript: Omit<VoiceTranscript, "timestamp">
): Promise<void> {
  const token = localStorage.getItem("token");
  
  const response = await fetch(
    `${API_URL}/api/voice/sessions/${sessionId}/transcript`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transcript),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add transcript");
  }
}

/**
 * End a voice therapy session
 */
export async function endVoiceSession(
  sessionId: string,
  summary?: SessionSummary
): Promise<{ session: Partial<VoiceSession> }> {
  const token = localStorage.getItem("token");
  
  const response = await fetch(
    `${API_URL}/api/voice/sessions/${sessionId}/end`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ summary }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to end session");
  }

  return await response.json();
}

/**
 * Get a specific voice session
 */
export async function getVoiceSession(sessionId: string): Promise<VoiceSession> {
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${API_URL}/api/voice/sessions/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get session");
  }

  const result = await response.json();
  return result.session;
}

/**
 * Get all voice sessions for the current user
 */
export async function getUserVoiceSessions(
  limit: number = 50
): Promise<VoiceSession[]> {
  const token = localStorage.getItem("token");
  
  const response = await fetch(
    `${API_URL}/api/voice/sessions?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get sessions");
  }

  const result = await response.json();
  return result.sessions;
}

/**
 * Get previous sessions context
 */
export async function getPreviousSessionsContext(
  numberOfSessions: number = 5
): Promise<string> {
  const token = localStorage.getItem("token");
  
  const response = await fetch(
    `${API_URL}/api/voice/context?sessions=${numberOfSessions}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get context");
  }

  const result = await response.json();
  return result.context;
}

/**
 * Search voice sessions
 */
export async function searchVoiceSessions(query: string): Promise<VoiceSession[]> {
  const token = localStorage.getItem("token");
  
  const response = await fetch(
    `${API_URL}/api/voice/search?query=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search sessions");
  }

  const result = await response.json();
  return result.sessions;
}

/**
 * Get session statistics
 */
export async function getVoiceSessionStats(): Promise<{
  totalSessions: number;
  totalDuration: number;
  averageDuration: number;
  averageRiskLevel: number;
  recentTopics: { topic: string; count: number }[];
  lastSessionDate?: Date;
}> {
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${API_URL}/api/voice/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get statistics");
  }

  const result = await response.json();
  return result.stats;
}
