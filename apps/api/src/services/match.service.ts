import { StatusCodes } from "http-status-codes";
import { MatchModel } from "../models/match.model.js";
import { MatchEventModel } from "../models/match-event.model.js";
import { HttpError } from "../utils/http-error.js";
import { applyEventToScore } from "./match-rules.js";
import { emitGlobal, emitMatch } from "../sockets/socket-hub.js";
import { createEventSchema, createMatchSchema, updateMatchSchema } from "../validation/match.schemas.js";
import { z } from "zod";
import { isValidObjectId } from "mongoose";

export async function listMatches() {
  return MatchModel.find().sort({ createdAt: -1 });
}

export async function createMatch(input: z.infer<typeof createMatchSchema>) {
  const match = await MatchModel.create({ ...input, homeScore: 0, awayScore: 0, minute: 0, status: "scheduled" });
  emitGlobal("match:created", { matchId: match.id, match });
  return match;
}

export async function getMatch(matchId: string) {
  if (!isValidObjectId(matchId)) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Invalid match id");
  }

  const match = await MatchModel.findById(matchId);
  if (!match) {
    throw new HttpError(StatusCodes.NOT_FOUND, "Match not found");
  }
  return match;
}

export async function updateMatch(matchId: string, input: z.infer<typeof updateMatchSchema>) {
  const match = await getMatch(matchId);
  if (match.status === "finished" && input.status !== "finished") {
    throw new HttpError(StatusCodes.CONFLICT, "Finished matches cannot be reopened from this endpoint");
  }

  Object.assign(match, input);
  await match.save();
  emitGlobal("match:updated", { matchId: match.id, match });
  emitMatch(match.id, "match:updated", { matchId: match.id, match });
  return match;
}

export async function startMatch(matchId: string) {
  const match = await getMatch(matchId);
  if (match.status === "finished") {
    throw new HttpError(StatusCodes.CONFLICT, "Finished matches cannot be started again");
  }

  match.status = "live";
  match.startedAt = match.startedAt ?? new Date();
  match.minute = Math.max(match.minute, 1);
  await match.save();
  emitGlobal("match:started", { matchId: match.id, match });
  emitMatch(match.id, "match:started", { matchId: match.id, match });
  return match;
}

export async function finishMatch(matchId: string) {
  const match = await getMatch(matchId);
  if (match.status !== "live") {
    throw new HttpError(StatusCodes.CONFLICT, "Only live matches can be finished");
  }

  match.status = "finished";
  match.finishedAt = new Date();
  await match.save();
  emitGlobal("match:finished", { matchId: match.id, match });
  emitMatch(match.id, "match:finished", { matchId: match.id, match });
  return match;
}

export async function listMatchEvents(matchId: string) {
  await getMatch(matchId);
  return MatchEventModel.find({ matchId }).sort({ minute: -1, createdAt: -1 });
}

export async function addMatchEvent(matchId: string, input: z.infer<typeof createEventSchema>) {
  const match = await getMatch(matchId);
  if (match.status !== "live") {
    throw new HttpError(StatusCodes.CONFLICT, "Events can only be added to live matches");
  }

  if (input.type === "goal" && input.team === "neutral") {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Goal events must be assigned to the home or away team");
  }

  const event = await MatchEventModel.create({ ...input, matchId });
  const nextScore = applyEventToScore(
    { homeScore: match.homeScore ?? 0, awayScore: match.awayScore ?? 0 },
    { type: input.type, team: input.team }
  );

  match.homeScore = nextScore.homeScore;
  match.awayScore = nextScore.awayScore;
  match.minute = Math.max(match.minute, input.minute);
  await match.save();

  emitGlobal("match:updated", { matchId: match.id, match });
  emitMatch(match.id, "match:updated", { matchId: match.id, match });
  emitMatch(match.id, "match:event-added", { matchId: match.id, match, event });

  return { match, event };
}
