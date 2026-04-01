import { Router } from "express";
import { OutboundCallController } from "../controllers/outboundCallController";
import { auth } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(auth);

// Schedule a call
router.post("/schedule", OutboundCallController.scheduleCall);

// Initiate immediate call
router.post("/initiate", OutboundCallController.initiateCall);

// Get all user calls
router.get("/calls", OutboundCallController.getUserCalls);

// Get specific call status
router.get("/calls/:callId", OutboundCallController.getCallStatus);

// Cancel a call
router.delete("/calls/:callId", OutboundCallController.cancelCall);

export default router;
