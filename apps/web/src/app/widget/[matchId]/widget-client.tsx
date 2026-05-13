"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { getSocket } from "@/lib/socket";
import { Match, MatchEvent } from "@/types";

export function WidgetClient({ initialMatch, initialEvents }: { initialMatch: Match; initialEvents: MatchEvent[] }) {
  const [match, setMatch] = useState(initialMatch);
  const [lastEvent, setLastEvent] = useState(initialEvents[0]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("match:join", match.id);
    socket.on("match:updated", ({ match: updated }: { match: Match }) => setMatch(updated));
    socket.on("match:event-added", ({ match: updated, event }: { match: Match; event: MatchEvent }) => {
      setMatch(updated);
      setLastEvent(event);
    });

    return () => {
      socket.emit("match:leave", match.id);
      socket.off("match:updated");
      socket.off("match:event-added");
    };
  }, [match.id]);

  return (
    <div className="mx-auto max-w-sm rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <StatusBadge status={match.status} />
        <span className="text-sm font-bold tabular-nums text-slate-600">{match.minute}&apos;</span>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="text-right text-sm font-semibold text-slate-900">{match.homeTeam}</div>
        <div className="rounded bg-slate-950 px-3 py-2 text-lg font-black tabular-nums text-white">
          {match.homeScore} - {match.awayScore}
        </div>
        <div className="text-sm font-semibold text-slate-900">{match.awayTeam}</div>
      </div>
      <div className="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-600">
        {lastEvent ? (
          <span>
            {lastEvent.minute}&apos; {lastEvent.description}
          </span>
        ) : (
          <span>No live events yet</span>
        )}
      </div>
    </div>
  );
}
