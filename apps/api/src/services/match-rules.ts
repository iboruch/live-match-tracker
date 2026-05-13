import { EventTeam, MatchEventType } from "../types.js";

export type ScoreSnapshot = {
  homeScore: number;
  awayScore: number;
};

export function applyEventToScore(score: ScoreSnapshot, event: { type: MatchEventType; team: EventTeam }) {
  if (event.type !== "goal") {
    return score;
  }

  if (event.team === "home") {
    return { ...score, homeScore: score.homeScore + 1 };
  }

  if (event.team === "away") {
    return { ...score, awayScore: score.awayScore + 1 };
  }

  return score;
}
