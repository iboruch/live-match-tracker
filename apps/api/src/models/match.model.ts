import mongoose, { HydratedDocument } from "mongoose";
import { matchStatuses } from "../types.js";

export type Match = {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: "scheduled" | "live" | "finished";
  minute: number;
  startedAt?: Date;
  finishedAt?: Date;
};

const matchSchema = new mongoose.Schema<Match>(
  {
    homeTeam: { type: String, required: true, trim: true, maxlength: 80 },
    awayTeam: { type: String, required: true, trim: true, maxlength: 80 },
    homeScore: { type: Number, required: true, default: 0, min: 0 },
    awayScore: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, enum: matchStatuses, default: "scheduled", index: true },
    minute: { type: Number, required: true, default: 0, min: 0, max: 130 },
    startedAt: { type: Date },
    finishedAt: { type: Date }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
      }
    }
  }
);

matchSchema.index({ status: 1, createdAt: -1 });

export type MatchDocument = HydratedDocument<Match>;
export const MatchModel = mongoose.model("Match", matchSchema);
