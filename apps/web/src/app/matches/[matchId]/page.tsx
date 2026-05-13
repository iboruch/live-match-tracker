import { api } from "@/lib/api";
import { MatchDetailClient } from "./match-detail-client";

export default async function MatchDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const [match, events] = await Promise.all([api.getMatch(matchId), api.listEvents(matchId)]);

  return <MatchDetailClient initialMatch={match} initialEvents={events} />;
}
