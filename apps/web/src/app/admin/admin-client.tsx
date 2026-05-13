"use client";

import { FormEvent, useState } from "react";
import { AlertCircle, Flag, Plus, Square, TimerReset } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/api";
import { Match, MatchEventType, EventTeam } from "@/types";

const eventTypes: MatchEventType[] = ["goal", "yellow_card", "red_card", "substitution", "var", "comment"];
const teams: EventTeam[] = ["home", "away", "neutral"];

export function AdminClient({ initialMatches }: { initialMatches: Match[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [selectedId, setSelectedId] = useState(initialMatches[0]?.id ?? "");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const selected = matches.find((match) => match.id === selectedId);

  async function refresh() {
    const nextMatches = await api.listMatches();
    setMatches(nextMatches);
    return nextMatches;
  }

  async function createMatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    const data = new FormData(form);
    const homeTeam = String(data.get("homeTeam") ?? "").trim();
    const awayTeam = String(data.get("awayTeam") ?? "").trim();
    if (homeTeam.length < 2 || awayTeam.length < 2) {
      setError("Both teams need at least two characters.");
      return;
    }

    try {
      setIsCreating(true);
      const match = await api.createMatch({ homeTeam, awayTeam });
      setMatches((current) => [match, ...current.filter((item) => item.id !== match.id)]);
      setSelectedId(match.id);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create match.");
    } finally {
      setIsCreating(false);
    }
  }

  async function updateSelected(next: Match) {
    setMatches((current) => current.map((match) => (match.id === next.id ? next : match)));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="rounded border border-slate-200 bg-white p-5">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Create fixtures and operate the live match state.</p>
        </div>
        <form onSubmit={createMatch} className="mt-5 space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Home team
            <input name="homeTeam" placeholder="Arsenal" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Away team
            <input name="awayTeam" placeholder="Barcelona" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
          </label>
          {error ? <InlineError message={error} /> : null}
          <button
            disabled={isCreating}
            className="inline-flex w-full items-center justify-center gap-2 rounded bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={16} />
            {isCreating ? "Creating..." : "Create match"}
          </button>
        </form>

        <div className="mt-6 space-y-2">
          {matches.length === 0 ? (
            <EmptyState title="No matches yet" body="Create a match to enable live controls." />
          ) : (
            matches.map((match) => (
              <button
                key={match.id}
                onClick={() => setSelectedId(match.id)}
                className={`w-full rounded border px-3 py-3 text-left transition hover:border-emerald-600 ${
                  selectedId === match.id ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-semibold text-slate-900">
                    {match.homeTeam} vs {match.awayTeam}
                  </span>
                  <StatusBadge status={match.status} />
                </div>
                <div className="mt-1 text-sm tabular-nums text-slate-500">
                  {match.homeScore} - {match.awayScore} · {match.minute}&apos;
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      {selected ? (
        <MatchControls match={selected} onChange={updateSelected} onRefresh={refresh} />
      ) : (
        <EmptyState title="Select a match" body="Create or choose a match to manage live state and events." />
      )}
    </div>
  );
}

function MatchControls({
  match,
  onChange,
  onRefresh
}: {
  match: Match;
  onChange: (match: Match) => void;
  onRefresh: () => Promise<Match[]>;
}) {
  const [eventError, setEventError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setEventError("");
    const data = new FormData(form);
    const minute = Number(data.get("minute"));
    const description = String(data.get("description") ?? "").trim();
    const type = data.get("type") as MatchEventType;
    const team = data.get("team") as EventTeam;

    if (!Number.isInteger(minute) || minute < 0 || minute > 130 || !description) {
      setEventError("Minute and description are required.");
      return;
    }
    if (type === "goal" && team === "neutral") {
      setEventError("Goal events must be assigned to the home or away team.");
      return;
    }

    try {
      setIsSaving(true);
      const result = await api.addEvent(match.id, {
        type,
        team,
        player: String(data.get("player") ?? "").trim(),
        minute,
        description
      });
      onChange(result.match);
      form.reset();
      await onRefresh();
    } catch (err) {
      setEventError(err instanceof Error ? err.message : "Could not add event.");
    } finally {
      setIsSaving(false);
    }
  }

  async function runAction(action: () => Promise<Match>) {
    try {
      setActionError("");
      setIsSaving(true);
      onChange(await action());
      await onRefresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            {match.homeTeam} vs {match.awayTeam}
          </h2>
          <p className="text-sm text-slate-500">
            {match.homeScore} - {match.awayScore} · {match.minute}&apos;
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => runAction(() => api.startMatch(match.id))}
            disabled={match.status === "finished" || isSaving}
            className="inline-flex items-center gap-2 rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Flag size={16} />
            Start
          </button>
          <button
            onClick={() => runAction(() => api.finishMatch(match.id))}
            disabled={match.status !== "live" || isSaving}
            className="inline-flex items-center gap-2 rounded bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Square size={16} />
            Finish
          </button>
        </div>
      </div>
      {actionError ? <div className="mt-4"><InlineError message={actionError} /></div> : null}

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          await runAction(() => api.updateMatch(match.id, { minute: Number(data.get("minute")) }));
        }}
        className="mt-6 flex max-w-xs gap-2"
      >
        <input
          name="minute"
          type="number"
          min="0"
          max="130"
          defaultValue={match.minute}
          className="w-full rounded border border-slate-300 px-3 py-2"
        />
        <button className="inline-flex items-center gap-2 rounded bg-slate-200 px-3 py-2 font-semibold text-slate-800 hover:bg-slate-300">
          <TimerReset size={16} />
          Update
        </button>
      </form>

      <form onSubmit={addEvent} className="mt-8 grid gap-3 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Event type
          <select name="type" className="mt-1 w-full rounded border border-slate-300 px-3 py-2">
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Team
          <select name="team" className="mt-1 w-full rounded border border-slate-300 px-3 py-2">
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Player
          <input name="player" placeholder="Optional" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Minute
          <input
            name="minute"
            type="number"
            min="0"
            max="130"
            defaultValue={match.minute}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700 md:col-span-2">
          Description
          <textarea
            name="description"
            placeholder="Describe what happened"
            className="mt-1 min-h-24 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        {eventError ? <div className="md:col-span-2"><InlineError message={eventError} /></div> : null}
        <button
          disabled={match.status !== "live" || isSaving}
          className="inline-flex items-center justify-center gap-2 rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
        >
          <Plus size={16} />
          {match.status === "live" ? "Add event" : "Start match to add events"}
        </button>
      </form>
    </section>
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
      <AlertCircle className="mt-0.5 shrink-0" size={16} />
      <span>{message}</span>
    </div>
  );
}
