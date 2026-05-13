export type MatchStatus = "scheduled" | "live" | "finished";
export type MatchEventType = "goal" | "yellow_card" | "red_card" | "substitution" | "var" | "comment";
export type EventTeam = "home" | "away" | "neutral";

export type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  minute: number;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type MatchEvent = {
  id: string;
  matchId: string;
  type: MatchEventType;
  team: EventTeam;
  player?: string;
  minute: number;
  description: string;
  createdAt: string;
};
