"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { EventTimeline } from "@/components/event-timeline";
import { StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { Match, MatchEvent } from "@/types";

export function MatchDetailClient({ initialMatch, initialEvents }: { initialMatch: Match; initialEvents: MatchEvent[] }) {
  const [match, setMatch] = useState(initialMatch);
  const [events, setEvents] = useState(initialEvents);
  const sortedEvents = useMemo(() => [...events].sort((a, b) => b.minute - a.minute), [events]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("match:join", match.id);

    socket.on("match:updated", ({ match: updated }: { match: Match }) => setMatch(updated));
    socket.on("match:started", ({ match: updated }: { match: Match }) => setMatch(updated));
    socket.on("match:finished", ({ match: updated }: { match: Match }) => setMatch(updated));
    socket.on("match:event-added", ({ match: updated, event }: { match: Match; event: MatchEvent }) => {
      setMatch(updated);
      setEvents((current) => [event, ...current.filter((item) => item.id !== event.id)]);
    });

    return () => {
      socket.emit("match:leave", match.id);
      socket.off("match:updated");
      socket.off("match:started");
      socket.off("match:finished");
      socket.off("match:event-added");
    };
  }, [match.id]);

  useEffect(() => {
    api.listEvents(match.id).then(setEvents).catch(() => undefined);
  }, [match.id]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <StatusBadge status={match.status} />
          <span className="text-sm font-semibold tabular-nums text-slate-500">{match.minute}&apos;</span>
        </div>
        <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <h1 className="text-right text-2xl font-bold text-slate-950">{match.homeTeam}</h1>
          <div className="rounded bg-slate-950 px-5 py-3 text-3xl font-black tabular-nums text-white">
            {match.homeScore} - {match.awayScore}
          </div>
          <h2 className="text-2xl font-bold text-slate-950">{match.awayTeam}</h2>
        </div>
      </section>

      <aside className="rounded border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-normal text-slate-500">Embed</h2>
        <Link
          href={`/widget/${match.id}`}
          className="mt-3 inline-flex items-center gap-2 rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          <ExternalLink size={16} />
          Open widget
        </Link>
      </aside>

      <section className="lg:col-span-2">
        <h2 className="mb-3 text-lg font-bold text-slate-950">Timeline</h2>
        <EventTimeline events={sortedEvents} />
      </section>
    </div>
  );
}
