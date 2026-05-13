import { api } from "@/lib/api";
import { WidgetClient } from "./widget-client";

export default async function WidgetPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const [match, events] = await Promise.all([api.getMatch(matchId), api.listEvents(matchId)]);

  return <WidgetClient initialMatch={match} initialEvents={events} />;
}
