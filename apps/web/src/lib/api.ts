import { Match, MatchEvent } from "@/types";

function getApiUrl() {
  if (typeof window === "undefined") {
    return process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  }

  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(body.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export const api = {
  listMatches: () => request<Match[]>("/api/matches"),
  createMatch: (body: { homeTeam: string; awayTeam: string }) =>
    request<Match>("/api/matches", { method: "POST", body: JSON.stringify(body) }),
  getMatch: (id: string) => request<Match>(`/api/matches/${id}`),
  updateMatch: (id: string, body: Partial<Pick<Match, "minute" | "homeTeam" | "awayTeam">>) =>
    request<Match>(`/api/matches/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  listEvents: (id: string) => request<MatchEvent[]>(`/api/matches/${id}/events`),
  startMatch: (id: string) => request<Match>(`/api/matches/${id}/start`, { method: "POST" }),
  finishMatch: (id: string) => request<Match>(`/api/matches/${id}/finish`, { method: "POST" }),
  addEvent: (
    id: string,
    body: Pick<MatchEvent, "type" | "team" | "minute" | "description"> & { player?: string }
  ) =>
    request<{ match: Match; event: MatchEvent }>(`/api/matches/${id}/events`, {
      method: "POST",
      body: JSON.stringify(body)
    })
};
