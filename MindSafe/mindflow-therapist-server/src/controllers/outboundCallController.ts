import { Request, Response } from "express";
import { VapiService } from "../services/vapiService";
import { ScheduledCall } from "../models/ScheduledCall";

export class OutboundCallController {
  /**
   * Schedule an outbound call
   */
  static async scheduleCall(req: Request, res: Response) {
    try {
      const { phoneNumber, userName, scheduledTime, notes } = req.body;
      const userId = (req as any).user?._id || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      // Validate phone number
      if (!VapiService.validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({ 
          error: "Invalid phone number format. Please enter a valid phone number." 
        });
      }

      // Parse scheduled time or use immediate
      const callTime = scheduledTime ? new Date(scheduledTime) : new Date();

      // Create scheduled call record
      const scheduledCall = new ScheduledCall({
        userId,
        phoneNumber,
        userName: userName || "User",
        scheduledTime: callTime,
        status: "pending",
        notes,
      });

      await scheduledCall.save();

      // If scheduled for now or past, initiate call immediately
      if (callTime <= new Date()) {
        const result = await VapiService.createOutboundCall({
          phoneNumber,
          userName: userName || "User",
          userId,
        });

        if (result.success) {
          scheduledCall.status = "calling";
          scheduledCall.vapiCallId = result.callId;
          await scheduledCall.save();

          return res.status(200).json({
            success: true,
            message: "Call initiated successfully",
            scheduledCall: {
              id: scheduledCall._id,
              phoneNumber: scheduledCall.phoneNumber,
              status: scheduledCall.status,
              callId: result.callId,
            },
          });
        } else {
          scheduledCall.status = "failed";
          // Ensure notes is a string, not an array
          let errorNote = "Failed to initiate call";
          if (typeof result.error === 'string') {
            errorNote = result.error;
          } else if (result.error && Array.isArray(result.error)) {
            errorNote = (result.error as string[]).join(", ");
          }
          scheduledCall.notes = errorNote;
          await scheduledCall.save();

          return res.status(500).json({
            success: false,
            error: result.error || "Failed to initiate call",
          });
        }
      }

      // Return scheduled call for future execution
      res.status(201).json({
        success: true,
        message: "Call scheduled successfully",
        scheduledCall: {
          id: scheduledCall._id,
          phoneNumber: scheduledCall.phoneNumber,
          scheduledTime: scheduledCall.scheduledTime,
          status: scheduledCall.status,
        },
      });
    } catch (error) {
      console.error("[OutboundCallController] Error scheduling call:", error);
      res.status(500).json({ 
        error: "Failed to schedule call",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  /**
   * Get all scheduled calls for user
   */
  static async getUserCalls(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id || (req as any).user?.id;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const calls = await ScheduledCall.find({ userId })
        .sort({ scheduledTime: -1 })
        .limit(limit);

      res.json({ success: true, calls, count: calls.length });
    } catch (error) {
      console.error("[OutboundCallController] Error getting calls:", error);
      res.status(500).json({ error: "Failed to get calls" });
    }
  }

  /**
   * Get call status
   */
  static async getCallStatus(req: Request, res: Response) {
    try {
      const { callId } = req.params;
      const userId = (req as any).user?._id || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const scheduledCall = await ScheduledCall.findOne({
        _id: callId,
        userId,
      });

      if (!scheduledCall) {
        return res.status(404).json({ error: "Call not found" });
      }

      // If call has VAPI ID, get status from VAPI
      if (scheduledCall.vapiCallId) {
        const vapiStatus = await VapiService.getCallStatus(
          scheduledCall.vapiCallId
        );
        
        if (vapiStatus.success) {
          // Update local status based on VAPI status
          const vapiCall = vapiStatus.call;
          if (vapiCall.status === "ended") {
            scheduledCall.status = "completed";
            scheduledCall.duration = vapiCall.duration;
            await scheduledCall.save();
          }
        }
      }

      res.json({ success: true, call: scheduledCall });
    } catch (error) {
      console.error("[OutboundCallController] Error getting call status:", error);
      res.status(500).json({ error: "Failed to get call status" });
    }
  }

  /**
   * Cancel a scheduled call
   */
  static async cancelCall(req: Request, res: Response) {
    try {
      const { callId } = req.params;
      const userId = (req as any).user?._id || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const scheduledCall = await ScheduledCall.findOne({
        _id: callId,
        userId,
      });

      if (!scheduledCall) {
        return res.status(404).json({ error: "Call not found" });
      }

      // If call is in progress, end it via VAPI
      if (scheduledCall.status === "calling" && scheduledCall.vapiCallId) {
        await VapiService.endCall(scheduledCall.vapiCallId);
      }

      scheduledCall.status = "cancelled";
      await scheduledCall.save();

      res.json({
        success: true,
        message: "Call cancelled successfully",
        call: scheduledCall,
      });
    } catch (error) {
      console.error("[OutboundCallController] Error cancelling call:", error);
      res.status(500).json({ error: "Failed to cancel call" });
    }
  }

  /**
   * Initiate immediate call (no scheduling)
   */
  static async initiateCall(req: Request, res: Response) {
    try {
      const { phoneNumber, userName } = req.body;
      const userId = (req as any).user?._id || (req as any).user?.id;

      console.log("[OutboundCallController] User from request:", (req as any).user);
      console.log("[OutboundCallController] Extracted userId:", userId);

      if (!userId) {
        console.log("[OutboundCallController] No userId found, returning 401");
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      console.log("[OutboundCallController] Validating phone number:", phoneNumber);

      // Validate phone number
      if (!VapiService.validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({ 
          error: "Invalid phone number format" 
        });
      }

      console.log("[OutboundCallController] Creating call record...");

      // Create call record
      const scheduledCall = new ScheduledCall({
        userId,
        phoneNumber,
        userName: userName || "User",
        scheduledTime: new Date(),
        status: "calling",
      });

      console.log("[OutboundCallController] Initiating VAPI call...");

      // Initiate call via VAPI
      const result = await VapiService.createOutboundCall({
        phoneNumber,
        userName: userName || "User",
        userId: String(userId),
      });

      console.log("[OutboundCallController] VAPI result:", result);

      if (result.success) {
        scheduledCall.vapiCallId = result.callId;
        await scheduledCall.save();

        return res.status(200).json({
          success: true,
          message: "Call initiated successfully",
          call: {
            id: scheduledCall._id,
            phoneNumber: scheduledCall.phoneNumber,
            status: scheduledCall.status,
            callId: result.callId,
          },
        });
      } else {
        scheduledCall.status = "failed";
        // Ensure notes is a string, not an array
        let errorNote = "Failed to initiate call";
        if (typeof result.error === 'string') {
          errorNote = result.error;
        } else if (result.error && Array.isArray(result.error)) {
          errorNote = (result.error as string[]).join(", ");
        }
        scheduledCall.notes = errorNote;
        await scheduledCall.save();

        return res.status(500).json({
          success: false,
          error: result.error || "Failed to initiate call",
        });
      }
    } catch (error) {
      console.error("[OutboundCallController] Error initiating call:", error);
      res.status(500).json({ 
        error: "Failed to initiate call",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
