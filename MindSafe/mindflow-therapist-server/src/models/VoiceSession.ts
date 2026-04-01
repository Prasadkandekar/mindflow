import { Document, Schema, model, Types } from "mongoose";

export interface IVoiceTranscript {
  speaker: "user" | "agent";
  text: string;
  timestamp: Date;
  duration?: number; // in seconds
  sentiment?: {
    score: number; // -1 to 1
    label: "positive" | "neutral" | "negative";
  };
  keywords?: string[];
}

export interface ISessionSummary {
  mainTopics: string[];
  emotionalState: string;
  keyInsights: string[];
  actionItems?: string[];
  riskLevel: number; // 0-10
  progressNotes: string;
}

export interface IVoiceSession extends Document {
  _id: Types.ObjectId;
  sessionId: string;
  userId: Types.ObjectId;
  therapistId: string; // Selected therapist avatar ID
  therapistName: string;
  roomName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  status: "active" | "completed" | "interrupted" | "archived";
  transcripts: IVoiceTranscript[];
  summary?: ISessionSummary;
  metadata?: {
    agentId?: string;
    connectionQuality?: string;
    deviceInfo?: string;
  };
  // Context from previous sessions for continuity
  contextFromPreviousSessions?: string;
  // Embeddings for semantic search (optional, for future vector DB integration)
  embeddings?: number[];
}

const voiceTranscriptSchema = new Schema<IVoiceTranscript>({
  speaker: { type: String, required: true, enum: ["user", "agent"] },
  text: { type: String, required: true },
  timestamp: { type: Date, required: true },
  duration: { type: Number },
  sentiment: {
    score: { type: Number, min: -1, max: 1 },
    label: { type: String, enum: ["positive", "neutral", "negative"] },
  },
  keywords: [{ type: String }],
});

const sessionSummarySchema = new Schema<ISessionSummary>({
  mainTopics: [{ type: String }],
  emotionalState: { type: String, required: true },
  keyInsights: [{ type: String }],
  actionItems: [{ type: String }],
  riskLevel: { type: Number, required: true, min: 0, max: 10 },
  progressNotes: { type: String, required: true },
});

const voiceSessionSchema = new Schema<IVoiceSession>(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    therapistId: { type: String, required: true },
    therapistName: { type: String, required: true },
    roomName: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number },
    status: {
      type: String,
      required: true,
      enum: ["active", "completed", "interrupted", "archived"],
      default: "active",
    },
    transcripts: [voiceTranscriptSchema],
    summary: sessionSummarySchema,
    metadata: {
      agentId: String,
      connectionQuality: String,
      deviceInfo: String,
    },
    contextFromPreviousSessions: { type: String },
    embeddings: [{ type: Number }],
  },
  { timestamps: true }
);

// Indexes for efficient querying
voiceSessionSchema.index({ userId: 1, startTime: -1 });
voiceSessionSchema.index({ sessionId: 1 });
voiceSessionSchema.index({ status: 1 });

export const VoiceSession = model<IVoiceSession>(
  "VoiceSession",
  voiceSessionSchema
);
