"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { MatchCard } from "@/components/match-card";
import { getSocket } from "@/lib/socket";
import { Match } from "@/types";

export function MatchesLiveList({ initialMatches }: { initialMatches: Match[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const sortedMatches = useMemo(
    () =>
      [...matches].sort((a, b) => {
        const rank = { live: 0, scheduled: 1, finished: 2 };
        return rank[a.status] - rank[b.status] || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [matches]
  );

  useEffect(() => {
    const socket = getSocket();

    function upsert({ match }: { match: Match }) {
      setMatches((current) => [match, ...current.filter((item) => item.id !== match.id)]);
    }

    socket.on("match:created", upsert);
    socket.on("match:updated", upsert);
    socket.on("match:started", upsert);
    socket.on("match:finished", upsert);

    return () => {
      socket.off("match:created", upsert);
      socket.off("match:updated", upsert);
      socket.off("match:started", upsert);
      socket.off("match:finished", upsert);
    };
  }, []);

  if (sortedMatches.length === 0) {
    return <EmptyState title="No matches found" body="Create the first match from the admin dashboard." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sortedMatches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
