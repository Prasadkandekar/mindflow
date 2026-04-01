import { Request, Response } from "express";
import { VoiceSessionService } from "../services/voiceSessionService";
import { IVoiceTranscript, ISessionSummary } from "../models/VoiceSession";

export class VoiceSessionController {
  /**
   * Create a new voice therapy session
   */
  static async createSession(req: Request, res: Response) {
    try {
      const { sessionId, therapistId, therapistName, roomName, metadata } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!sessionId || !therapistId || !therapistName || !roomName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const session = await VoiceSessionService.createSession({
        sessionId,
        userId,
        therapistId,
        therapistName,
        roomName,
        metadata,
      });

      res.status(201).json({
        success: true,
        session: {
          sessionId: session.sessionId,
          startTime: session.startTime,
          contextFromPreviousSessions: session.contextFromPreviousSessions,
        },
      });
    } catch (error) {
      console.error("[VoiceSessionController] Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  }

  /**
   * Add transcript to session
   */
  static async addTranscript(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const transcript: IVoiceTranscript = req.body;

      if (!transcript.speaker || !transcript.text) {
        return res.status(400).json({ error: "Invalid transcript data" });
      }

      transcript.timestamp = new Date();

      const session = await VoiceSessionService.addTranscript(sessionId, transcript);

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json({ success: true, transcriptCount: session.transcripts.length });
    } catch (error) {
      console.error("[VoiceSessionController] Error adding transcript:", error);
      res.status(500).json({ error: "Failed to add transcript" });
    }
  }

  /**
   * End a session
   */
  static async endSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { summary } = req.body;

      const session = await VoiceSessionService.endSession(sessionId, summary);

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json({
        success: true,
        session: {
          sessionId: session.sessionId,
          duration: session.duration,
          summary: session.summary,
        },
      });
    } catch (error) {
      console.error("[VoiceSessionController] Error ending session:", error);
      res.status(500).json({ error: "Failed to end session" });
    }
  }

  /**
   * Get session details
   */
  static async getSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const session = await VoiceSessionService.getSession(sessionId);

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json({ success: true, session });
    } catch (error) {
      console.error("[VoiceSessionController] Error getting session:", error);
      res.status(500).json({ error: "Failed to get session" });
    }
  }

  /**
   * Get all sessions for current user
   */
  static async getUserSessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const sessions = await VoiceSessionService.getUserSessions(userId, limit);

      res.json({ success: true, sessions, count: sessions.length });
    } catch (error) {
      console.error("[VoiceSessionController] Error getting user sessions:", error);
      res.status(500).json({ error: "Failed to get sessions" });
    }
  }

  /**
   * Get previous sessions context for a user
   */
  static async getPreviousContext(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const numberOfSessions = parseInt(req.query.sessions as string) || 5;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const context = await VoiceSessionService.getPreviousSessionsContext(
        userId,
        numberOfSessions
      );

      res.json({ success: true, context });
    } catch (error) {
      console.error("[VoiceSessionController] Error getting context:", error);
      res.status(500).json({ error: "Failed to get context" });
    }
  }

  /**
   * Search sessions
   */
  static async searchSessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { query } = req.query;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Search query required" });
      }

      const sessions = await VoiceSessionService.searchSessions(userId, query);

      res.json({ success: true, sessions, count: sessions.length });
    } catch (error) {
      console.error("[VoiceSessionController] Error searching sessions:", error);
      res.status(500).json({ error: "Failed to search sessions" });
    }
  }

  /**
   * Get session statistics
   */
  static async getSessionStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const stats = await VoiceSessionService.getUserSessionStats(userId);

      res.json({ success: true, stats });
    } catch (error) {
      console.error("[VoiceSessionController] Error getting stats:", error);
      res.status(500).json({ error: "Failed to get statistics" });
    }
  }
}
