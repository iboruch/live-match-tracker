import mongoose, { HydratedDocument } from "mongoose";
import { eventTeams, eventTypes } from "../types.js";

export type MatchEvent = {
  matchId: mongoose.Types.ObjectId;
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "var" | "comment";
  team: "home" | "away" | "neutral";
  player?: string;
  minute: number;
  description: string;
};

const matchEventSchema = new mongoose.Schema<MatchEvent>(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true, index: true },
    type: { type: String, enum: eventTypes, required: true },
    team: { type: String, enum: eventTeams, required: true, default: "neutral" },
    player: { type: String, trim: true, maxlength: 100 },
    minute: { type: Number, required: true, min: 0, max: 130 },
    description: { type: String, required: true, trim: true, maxlength: 500 }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

matchEventSchema.index({ matchId: 1, minute: -1, createdAt: -1 });

export type MatchEventDocument = HydratedDocument<MatchEvent>;
export const MatchEventModel = mongoose.model("MatchEvent", matchEventSchema);
