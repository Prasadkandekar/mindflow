import { Document, Schema, model, Types } from "mongoose";

export interface IScheduledCall extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  phoneNumber: string;
  userName: string;
  scheduledTime: Date;
  status: "pending" | "calling" | "completed" | "failed" | "cancelled";
  callId?: string;
  vapiCallId?: string;
  duration?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const scheduledCallSchema = new Schema<IScheduledCall>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    phoneNumber: { type: String, required: true },
    userName: { type: String, required: true },
    scheduledTime: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "calling", "completed", "failed", "cancelled"],
      default: "pending",
    },
    callId: { type: String },
    vapiCallId: { type: String },
    duration: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes for efficient querying
scheduledCallSchema.index({ userId: 1, scheduledTime: -1 });
scheduledCallSchema.index({ status: 1, scheduledTime: 1 });

export const ScheduledCall = model<IScheduledCall>(
  "ScheduledCall",
  scheduledCallSchema
);
