import { StatusCodes } from "http-status-codes";
import { MatchModel } from "../models/match.model.js";
import { MatchEventModel } from "../models/match-event.model.js";
import { HttpError } from "../utils/http-error.js";
import { applyEventToScore } from "./match-rules.js";
import { emitGlobal, emitMatch } from "../sockets/socket-hub.js";
import { createEventSchema, createMatchSchema, updateMatchSchema } from "../validation/match.schemas.js";
import { z } from "zod";

export async function listMatches() {
  return MatchModel.find().sort({ createdAt: -1 });
}

export async function createMatch(input: z.infer<typeof createMatchSchema>) {
  const match = await MatchModel.create(input);
  emitGlobal("match:created", { match });
  return match;
}

export async function getMatch(matchId: string) {
  const match = await MatchModel.findById(matchId);
  if (!match) {
    throw new HttpError(StatusCodes.NOT_FOUND, "Match not found");
  }
  return match;
}

export async function updateMatch(matchId: string, input: z.infer<typeof updateMatchSchema>) {
  const match = await getMatch(matchId);
  Object.assign(match, input);
  await match.save();
  emitGlobal("match:updated", { match });
  emitMatch(match.id, "match:updated", { match });
  return match;
}

export async function startMatch(matchId: string) {
  const match = await getMatch(matchId);
  match.status = "live";
  match.startedAt = match.startedAt ?? new Date();
  match.minute = Math.max(match.minute, 1);
  await match.save();
  emitGlobal("match:started", { match });
  emitMatch(match.id, "match:started", { match });
  return match;
}

export async function finishMatch(matchId: string) {
  const match = await getMatch(matchId);
  match.status = "finished";
  match.finishedAt = new Date();
  await match.save();
  emitGlobal("match:finished", { match });
  emitMatch(match.id, "match:finished", { match });
  return match;
}

export async function listMatchEvents(matchId: string) {
  await getMatch(matchId);
  return MatchEventModel.find({ matchId }).sort({ minute: -1, createdAt: -1 });
}

export async function addMatchEvent(matchId: string, input: z.infer<typeof createEventSchema>) {
  const match = await getMatch(matchId);
  const event = await MatchEventModel.create({ ...input, matchId });
  const nextScore = applyEventToScore(match, input);

  match.homeScore = nextScore.homeScore;
  match.awayScore = nextScore.awayScore;
  match.minute = Math.max(match.minute, input.minute);
  await match.save();

  emitGlobal("match:updated", { match });
  emitMatch(match.id, "match:updated", { match });
  emitMatch(match.id, "match:event-added", { match, event });

  return { match, event };
}
