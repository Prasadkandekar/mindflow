import express from "express";
import { auth } from "../middleware/auth";
import { logActivity, getActivities } from "../controllers/activityController";

const router = express.Router();

// All routes are protected with authentication
router.use(auth);

// Get activities for the authenticated user
router.get("/", getActivities);

// Log a new activity
router.post("/", logActivity);

export default router;
