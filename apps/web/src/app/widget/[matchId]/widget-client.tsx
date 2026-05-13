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
    const handleMatchChange = ({ match: updated }: { match: Match }) => setMatch(updated);
    const handleEventAdded = ({ match: updated, event }: { match: Match; event: MatchEvent }) => {
      setMatch(updated);
      setLastEvent(event);
    };

    socket.emit("match:join", match.id);
    socket.on("match:updated", handleMatchChange);
    socket.on("match:started", handleMatchChange);
    socket.on("match:finished", handleMatchChange);
    socket.on("match:event-added", handleEventAdded);

    return () => {
      socket.emit("match:leave", match.id);
      socket.off("match:updated", handleMatchChange);
      socket.off("match:started", handleMatchChange);
      socket.off("match:finished", handleMatchChange);
      socket.off("match:event-added", handleEventAdded);
    };
  }, [match.id]);

  return (
    <div className="mx-auto max-w-sm rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <StatusBadge status={match.status} />
        <span className="text-sm font-bold tabular-nums text-slate-600">{match.minute}&apos;</span>
      </div>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <div className="truncate text-right text-sm font-semibold text-slate-900">{match.homeTeam}</div>
        <div className="rounded bg-slate-950 px-3 py-2 text-lg font-black tabular-nums text-white">
          {match.homeScore} - {match.awayScore}
        </div>
        <div className="truncate text-sm font-semibold text-slate-900">{match.awayTeam}</div>
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
