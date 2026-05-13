import { MatchesLiveList } from "@/components/matches-live-list";
import { api } from "@/lib/api";

export default async function MatchesPage() {
  const matches = await api.listMatches().catch(() => []);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Matches</h1>
          <p className="mt-2 text-slate-600">Public live scores and timelines powered by Socket.IO updates.</p>
        </div>
      </div>
      <MatchesLiveList initialMatches={matches} />
    </div>
  );
}
