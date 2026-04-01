import { Router } from "express";
import { VoiceSessionController } from "../controllers/voiceSessionController";
import { auth } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(auth);

// Create a new voice session
router.post("/sessions", VoiceSessionController.createSession);

// Add transcript to a session
router.post("/sessions/:sessionId/transcript", VoiceSessionController.addTranscript);

// End a session
router.post("/sessions/:sessionId/end", VoiceSessionController.endSession);

// Get session details
router.get("/sessions/:sessionId", VoiceSessionController.getSession);

// Get all sessions for current user
router.get("/sessions", VoiceSessionController.getUserSessions);

// Get previous sessions context
router.get("/context", VoiceSessionController.getPreviousContext);

// Search sessions
router.get("/search", VoiceSessionController.searchSessions);

// Get session statistics
router.get("/stats", VoiceSessionController.getSessionStats);

export default router;
