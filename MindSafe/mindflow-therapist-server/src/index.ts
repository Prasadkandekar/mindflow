import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { serve } from "inngest/express";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import authRouter from "./routes/auth";
import chatRouter from "./routes/chat";
import moodRouter from "./routes/mood";
import activityRouter from "./routes/activity";
import voiceSessionRouter from "./routes/voiceSession";
import outboundCallRouter from "./routes/outboundCall";
import { connectDB } from "./utils/db";
import { inngest } from "./inngest/client";
import { functions as inngestFunctions } from "./inngest/functions";

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: "*", // Allow all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
})); // Enable CORS for all origins
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev")); // HTTP request logger

// Set up Inngest endpoint
app.use(
  "/api/inngest",
  serve({ client: inngest, functions: inngestFunctions })
);


// Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Test endpoint for outbound calls
app.get("/api/outbound/test", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Outbound call routes are working",
    routes: [
      "POST /api/outbound/initiate",
      "POST /api/outbound/schedule",
      "GET /api/outbound/calls",
      "GET /api/outbound/calls/:callId",
      "DELETE /api/outbound/calls/:callId"
    ]
  });
});

app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/api/mood", moodRouter);
app.use("/api/activity", activityRouter);
app.use("/api/voice", voiceSessionRouter);
app.use("/api/outbound", outboundCallRouter);

console.log("[Server] Routes registered:");
console.log("  - /auth");
console.log("  - /chat");
console.log("  - /api/mood");
console.log("  - /api/activity");
console.log("  - /api/voice");
console.log("  - /api/outbound");

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Then start the server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(
        `Inngest endpoint available at http://localhost:${PORT}/api/inngest`
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
