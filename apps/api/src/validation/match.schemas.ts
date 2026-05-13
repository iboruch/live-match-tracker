import { z } from "zod";
import { eventTeams, eventTypes, matchStatuses } from "../types.js";

export const createMatchSchema = z.object({
  homeTeam: z.string().trim().min(2).max(80),
  awayTeam: z.string().trim().min(2).max(80)
}).refine((value) => value.homeTeam.toLowerCase() !== value.awayTeam.toLowerCase(), {
  message: "Home and away teams must be different",
  path: ["awayTeam"]
});

export const updateMatchSchema = z.object({
  homeTeam: z.string().trim().min(2).max(80).optional(),
  awayTeam: z.string().trim().min(2).max(80).optional(),
  homeScore: z.number().int().min(0).optional(),
  awayScore: z.number().int().min(0).optional(),
  status: z.enum(matchStatuses).optional(),
  minute: z.number().int().min(0).max(130).optional()
});

export const createEventSchema = z.object({
  type: z.enum(eventTypes),
  team: z.enum(eventTeams).default("neutral"),
  player: z.string().trim().max(100).optional().or(z.literal("")),
  minute: z.number().int().min(0).max(130),
  description: z.string().trim().min(1).max(500)
}).refine((value) => value.type !== "goal" || value.team !== "neutral", {
  message: "Goal events must be assigned to the home or away team",
  path: ["team"]
});
