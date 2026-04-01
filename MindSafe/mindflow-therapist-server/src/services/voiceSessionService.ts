import { VoiceSession, IVoiceSession, IVoiceTranscript, ISessionSummary } from "../models/VoiceSession";
import { Types } from "mongoose";

export class VoiceSessionService {
  /**
   * Create a new voice therapy session
   */
  static async createSession(data: {
    sessionId: string;
    userId: string;
    therapistId: string;
    therapistName: string;
    roomName: string;
    metadata?: any;
  }): Promise<IVoiceSession> {
    try {
      // Get context from previous sessions
      const previousContext = await this.getPreviousSessionsContext(data.userId, 5);

      const session = new VoiceSession({
        sessionId: data.sessionId,
        userId: new Types.ObjectId(data.userId),
        therapistId: data.therapistId,
        therapistName: data.therapistName,
        roomName: data.roomName,
        startTime: new Date(),
        status: "active",
        transcripts: [],
        metadata: data.metadata,
        contextFromPreviousSessions: previousContext,
      });

      await session.save();
      console.log(`[VoiceSessionService] Created session: ${data.sessionId}`);
      return session;
    } catch (error) {
      console.error("[VoiceSessionService] Error creating session:", error);
      throw error;
    }
  }

  /**
   * Add a transcript entry to a session
   */
  static async addTranscript(
    sessionId: string,
    transcript: IVoiceTranscript
  ): Promise<IVoiceSession | null> {
    try {
      const session = await VoiceSession.findOneAndUpdate(
        { sessionId },
        { $push: { transcripts: transcript } },
        { new: true }
      );

      if (!session) {
        console.error(`[VoiceSessionService] Session not found: ${sessionId}`);
        return null;
      }

      return session;
    } catch (error) {
      console.error("[VoiceSessionService] Error adding transcript:", error);
      throw error;
    }
  }

  /**
   * End a session and generate summary
   */
  static async endSession(
    sessionId: string,
    summary?: ISessionSummary
  ): Promise<IVoiceSession | null> {
    try {
      const session = await VoiceSession.findOne({ sessionId });
      
      if (!session) {
        console.error(`[VoiceSessionService] Session not found: ${sessionId}`);
        return null;
      }

      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

      // Generate summary if not provided
      const sessionSummary = summary || await this.generateSessionSummary(session);

      session.endTime = endTime;
      session.duration = duration;
      session.status = "completed";
      session.summary = sessionSummary;

      await session.save();
      console.log(`[VoiceSessionService] Ended session: ${sessionId}`);
      return session;
    } catch (error) {
      console.error("[VoiceSessionService] Error ending session:", error);
      throw error;
    }
  }

  /**
   * Get session by ID
   */
  static async getSession(sessionId: string): Promise<IVoiceSession | null> {
    try {
      return await VoiceSession.findOne({ sessionId });
    } catch (error) {
      console.error("[VoiceSessionService] Error getting session:", error);
      throw error;
    }
  }

  /**
   * Get all sessions for a user
   */
  static async getUserSessions(
    userId: string,
    limit: number = 50
  ): Promise<IVoiceSession[]> {
    try {
      return await VoiceSession.find({ userId: new Types.ObjectId(userId) })
        .sort({ startTime: -1 })
        .limit(limit);
    } catch (error) {
      console.error("[VoiceSessionService] Error getting user sessions:", error);
      throw error;
    }
  }

  /**
   * Get context from previous sessions for continuity
   * Returns a formatted string with key information from recent sessions
   */
  static async getPreviousSessionsContext(
    userId: string,
    numberOfSessions: number = 5
  ): Promise<string> {
    try {
      const previousSessions = await VoiceSession.find({
        userId: new Types.ObjectId(userId),
        status: "completed",
      })
        .sort({ startTime: -1 })
        .limit(numberOfSessions)
        .select("startTime summary transcripts therapistName");

      if (previousSessions.length === 0) {
        return "This is the user's first therapy session.";
      }

      let context = `Previous therapy sessions context (${previousSessions.length} sessions):\n\n`;

      previousSessions.reverse().forEach((session, index) => {
        const sessionDate = session.startTime.toLocaleDateString();
        context += `Session ${index + 1} (${sessionDate}) with ${session.therapistName}:\n`;

        if (session.summary) {
          context += `- Emotional State: ${session.summary.emotionalState}\n`;
          context += `- Main Topics: ${session.summary.mainTopics.join(", ")}\n`;
          context += `- Key Insights: ${session.summary.keyInsights.join("; ")}\n`;
          context += `- Progress Notes: ${session.summary.progressNotes}\n`;
          
          if (session.summary.actionItems && session.summary.actionItems.length > 0) {
            context += `- Action Items: ${session.summary.actionItems.join("; ")}\n`;
          }
          
          context += `- Risk Level: ${session.summary.riskLevel}/10\n`;
        }

        // Add a few key transcript excerpts for deeper context
        const userMessages = session.transcripts
          .filter((t) => t.speaker === "user")
          .slice(0, 3);
        
        if (userMessages.length > 0) {
          context += `- Key User Statements: ${userMessages.map(m => `"${m.text}"`).join("; ")}\n`;
        }

        context += "\n";
      });

      return context;
    } catch (error) {
      console.error("[VoiceSessionService] Error getting previous sessions context:", error);
      return "Unable to retrieve previous session context.";
    }
  }

  /**
   * Generate a summary from session transcripts
   * This is a basic implementation - can be enhanced with AI/NLP
   */
  private static async generateSessionSummary(
    session: IVoiceSession
  ): Promise<ISessionSummary> {
    // Extract keywords and topics from transcripts
    const allText = session.transcripts.map((t) => t.text).join(" ");
    const words = allText.toLowerCase().split(/\s+/);
    
    // Simple keyword extraction (can be enhanced with NLP)
    const commonWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "i", "you", "we", "they", "he", "she", "it", "my", "your", "our", "their", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "feel", "feeling", "like", "just", "really", "very", "so", "about"]);
    
    const keywords = words
      .filter((word) => word.length > 4 && !commonWords.has(word))
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const mainTopics = Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    // Analyze sentiment (basic implementation)
    const positiveWords = ["happy", "good", "better", "great", "wonderful", "positive", "hopeful", "grateful", "thankful", "excited"];
    const negativeWords = ["sad", "bad", "worse", "terrible", "awful", "negative", "hopeless", "anxious", "worried", "depressed", "stressed"];
    
    const positiveCount = words.filter((w) => positiveWords.includes(w)).length;
    const negativeCount = words.filter((w) => negativeWords.includes(w)).length;
    
    let emotionalState = "neutral";
    if (positiveCount > negativeCount * 1.5) {
      emotionalState = "positive";
    } else if (negativeCount > positiveCount * 1.5) {
      emotionalState = "struggling";
    }

    // Calculate risk level based on negative sentiment and crisis keywords
    const crisisKeywords = ["suicide", "kill", "die", "hurt", "harm", "end", "hopeless"];
    const crisisCount = words.filter((w) => crisisKeywords.includes(w)).length;
    const riskLevel = Math.min(10, Math.floor((negativeCount / words.length) * 10) + crisisCount * 3);

    return {
      mainTopics,
      emotionalState,
      keyInsights: [
        `Session lasted ${Math.floor((session.transcripts.length * 30) / 60)} minutes with ${session.transcripts.length} exchanges`,
        `Primary discussion topics: ${mainTopics.slice(0, 3).join(", ")}`,
      ],
      actionItems: [],
      riskLevel,
      progressNotes: `User discussed ${mainTopics.join(", ")}. Emotional state appears ${emotionalState}.`,
    };
  }

  /**
   * Search sessions by keywords or topics
   */
  static async searchSessions(
    userId: string,
    query: string
  ): Promise<IVoiceSession[]> {
    try {
      return await VoiceSession.find({
        userId: new Types.ObjectId(userId),
        $or: [
          { "transcripts.text": { $regex: query, $options: "i" } },
          { "summary.mainTopics": { $regex: query, $options: "i" } },
          { "summary.keyInsights": { $regex: query, $options: "i" } },
        ],
      })
        .sort({ startTime: -1 })
        .limit(20);
    } catch (error) {
      console.error("[VoiceSessionService] Error searching sessions:", error);
      throw error;
    }
  }

  /**
   * Get session statistics for a user
   */
  static async getUserSessionStats(userId: string) {
    try {
      const sessions = await VoiceSession.find({
        userId: new Types.ObjectId(userId),
        status: "completed",
      });

      const totalSessions = sessions.length;
      const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

      const riskLevels = sessions
        .filter((s) => s.summary?.riskLevel !== undefined)
        .map((s) => s.summary!.riskLevel);
      
      const averageRiskLevel = riskLevels.length > 0
        ? riskLevels.reduce((sum, r) => sum + r, 0) / riskLevels.length
        : 0;

      const recentSessions = sessions.slice(0, 5);
      const recentTopics = recentSessions
        .flatMap((s) => s.summary?.mainTopics || [])
        .reduce((acc, topic) => {
          acc[topic] = (acc[topic] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      return {
        totalSessions,
        totalDuration,
        averageDuration: Math.floor(averageDuration),
        averageRiskLevel: Math.round(averageRiskLevel * 10) / 10,
        recentTopics: Object.entries(recentTopics)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([topic, count]) => ({ topic, count })),
        lastSessionDate: sessions[0]?.startTime,
      };
    } catch (error) {
      console.error("[VoiceSessionService] Error getting session stats:", error);
      throw error;
    }
  }
}
