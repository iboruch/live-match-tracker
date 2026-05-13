export const matchStatuses = ["scheduled", "live", "finished"] as const;
export type MatchStatus = (typeof matchStatuses)[number];

export const eventTypes = ["goal", "yellow_card", "red_card", "substitution", "var", "comment"] as const;
export type MatchEventType = (typeof eventTypes)[number];

export const eventTeams = ["home", "away", "neutral"] as const;
export type EventTeam = (typeof eventTeams)[number];
