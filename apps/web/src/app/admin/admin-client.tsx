"use client";

import { FormEvent, useEffect, useState } from "react";
import { Flag, Plus, Square, TimerReset } from "lucide-react";
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
  const selected = matches.find((match) => match.id === selectedId);

  async function refresh() {
    setMatches(await api.listMatches());
  }

  async function createMatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const homeTeam = String(data.get("homeTeam") ?? "").trim();
    const awayTeam = String(data.get("awayTeam") ?? "").trim();
    if (homeTeam.length < 2 || awayTeam.length < 2) {
      setError("Both teams need at least two characters.");
      return;
    }
    const match = await api.createMatch({ homeTeam, awayTeam });
    setMatches((current) => [match, ...current]);
    setSelectedId(match.id);
    event.currentTarget.reset();
  }

  async function updateSelected(next: Match) {
    setMatches((current) => current.map((match) => (match.id === next.id ? next : match)));
  }

  useEffect(() => {
    if (!selectedId && matches[0]) setSelectedId(matches[0].id);
  }, [matches, selectedId]);

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="rounded border border-slate-200 bg-white p-5">
        <h1 className="text-xl font-bold text-slate-950">Admin Dashboard</h1>
        <form onSubmit={createMatch} className="mt-5 space-y-3">
          <input name="homeTeam" placeholder="Home team" className="w-full rounded border border-slate-300 px-3 py-2" />
          <input name="awayTeam" placeholder="Away team" className="w-full rounded border border-slate-300 px-3 py-2" />
          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          <button className="inline-flex w-full items-center justify-center gap-2 rounded bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800">
            <Plus size={16} />
            Create match
          </button>
        </form>

        <div className="mt-6 space-y-2">
          {matches.map((match) => (
            <button
              key={match.id}
              onClick={() => setSelectedId(match.id)}
              className="w-full rounded border border-slate-200 px-3 py-3 text-left hover:border-emerald-600"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">
                  {match.homeTeam} vs {match.awayTeam}
                </span>
                <StatusBadge status={match.status} />
              </div>
              <div className="mt-1 text-sm tabular-nums text-slate-500">
                {match.homeScore} - {match.awayScore} · {match.minute}&apos;
              </div>
            </button>
          ))}
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
  onRefresh: () => void;
}) {
  const [eventError, setEventError] = useState("");

  async function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEventError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const minute = Number(data.get("minute"));
    const description = String(data.get("description") ?? "").trim();
    if (!Number.isInteger(minute) || minute < 0 || minute > 130 || !description) {
      setEventError("Minute and description are required.");
      return;
    }

    const result = await api.addEvent(match.id, {
      type: data.get("type") as MatchEventType,
      team: data.get("team") as EventTeam,
      player: String(data.get("player") ?? "").trim(),
      minute,
      description
    });
    onChange(result.match);
    form.reset();
    await onRefresh();
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
            onClick={async () => onChange(await api.startMatch(match.id))}
            className="inline-flex items-center gap-2 rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            <Flag size={16} />
            Start
          </button>
          <button
            onClick={async () => onChange(await api.finishMatch(match.id))}
            className="inline-flex items-center gap-2 rounded bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Square size={16} />
            Finish
          </button>
        </div>
      </div>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          onChange(await api.updateMatch(match.id, { minute: Number(data.get("minute")) }));
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
        <select name="type" className="rounded border border-slate-300 px-3 py-2">
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type.replace("_", " ")}
            </option>
          ))}
        </select>
        <select name="team" className="rounded border border-slate-300 px-3 py-2">
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
        <input name="player" placeholder="Player" className="rounded border border-slate-300 px-3 py-2" />
        <input
          name="minute"
          type="number"
          min="0"
          max="130"
          defaultValue={match.minute}
          className="rounded border border-slate-300 px-3 py-2"
        />
        <textarea
          name="description"
          placeholder="Description"
          className="min-h-24 rounded border border-slate-300 px-3 py-2 md:col-span-2"
        />
        {eventError ? <p className="text-sm font-medium text-red-600 md:col-span-2">{eventError}</p> : null}
        <button className="inline-flex items-center justify-center gap-2 rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 md:col-span-2">
          <Plus size={16} />
          Add event
        </button>
      </form>
    </section>
  );
}
