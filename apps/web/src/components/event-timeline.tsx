import { MatchEvent } from "@/types";
import { EmptyState } from "./empty-state";

const eventLabels: Record<MatchEvent["type"], string> = {
  goal: "Goal",
  yellow_card: "Yellow card",
  red_card: "Red card",
  substitution: "Substitution",
  var: "VAR",
  comment: "Comment"
};

export function EventTimeline({ events }: { events: MatchEvent[] }) {
  if (events.length === 0) {
    return <EmptyState title="No events yet" body="Live incidents will appear here as the admin adds them." />;
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="rounded border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {eventLabels[event.type]} {event.player ? `- ${event.player}` : ""}
              </div>
              <p className="mt-1 text-sm text-slate-600">{event.description}</p>
            </div>
            <span className="rounded bg-slate-100 px-2 py-1 text-sm font-semibold tabular-nums text-slate-700">
              {event.minute}&apos;
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
