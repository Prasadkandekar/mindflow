import { Request, Response, NextFunction } from "express";
import { Activity, IActivity } from "../models/Activity";
import { logger } from "../utils/logger";
import { sendActivityCompletionEvent } from "../utils/inngestEvents";

// Get activities for the authenticated user
export const getActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get query parameters for filtering
    const { startDate, endDate, type } = req.query;

    // Build query
    const query: any = { userId };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate as string);
      }
    }

    // Add type filter if provided
    if (type) {
      query.type = type;
    }

    const activities = await Activity.find(query).sort({ timestamp: -1 });

    logger.info(`Fetched ${activities.length} activities for user ${userId}`);

    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};

// Log a new activity
export const logActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, name, description, duration, difficulty, feedback } =
      req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const activity = new Activity({
      userId,
      type,
      name,
      description,
      duration,
      difficulty,
      feedback,
      timestamp: new Date(),
    });

    await activity.save();
    logger.info(`Activity logged for user ${userId}`);

    // Send activity completion event to Inngest
    await sendActivityCompletionEvent({
      userId,
      id: activity._id,
      type,
      name,
      duration,
      difficulty,
      feedback,
      timestamp: activity.timestamp,
    });

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};
