import Link from "next/link";
import { Activity } from "lucide-react";
import { Match } from "@/types";
import { StatusBadge } from "./status-badge";

export function MatchCard({ match }: { match: Match }) {
  return (
    <Link
      href={`/matches/${match.id}`}
      className="block rounded border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <div className="flex items-center justify-between gap-3">
        <StatusBadge status={match.status} />
        <span className="inline-flex items-center gap-1 text-sm text-slate-500">
          <Activity size={14} />
          {match.minute}&apos;
        </span>
      </div>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <div className="min-w-0 truncate text-right font-semibold text-slate-900">{match.homeTeam}</div>
        <div className="rounded bg-slate-950 px-3 py-2 text-lg font-bold tabular-nums text-white shadow-sm">
          {match.homeScore} - {match.awayScore}
        </div>
        <div className="min-w-0 truncate font-semibold text-slate-900">{match.awayTeam}</div>
      </div>
      <div className="mt-4 text-xs font-medium text-slate-400">Open live timeline</div>
    </Link>
  );
}
