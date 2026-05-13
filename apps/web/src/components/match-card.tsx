import Link from "next/link";
import { Activity } from "lucide-react";
import { Match } from "@/types";
import { StatusBadge } from "./status-badge";

export function MatchCard({ match }: { match: Match }) {
  return (
    <Link
      href={`/matches/${match.id}`}
      className="block rounded border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-500 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-3">
        <StatusBadge status={match.status} />
        <span className="inline-flex items-center gap-1 text-sm text-slate-500">
          <Activity size={14} />
          {match.minute}&apos;
        </span>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="min-w-0 text-right font-semibold text-slate-900">{match.homeTeam}</div>
        <div className="rounded bg-slate-950 px-3 py-2 text-lg font-bold tabular-nums text-white">
          {match.homeScore} - {match.awayScore}
        </div>
        <div className="min-w-0 font-semibold text-slate-900">{match.awayTeam}</div>
      </div>
    </Link>
  );
}
