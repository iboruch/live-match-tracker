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
    return <EmptyState title="Timeline is quiet" body="Goals, cards, substitutions, VAR checks, and comments will appear here in real time." />;
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                <span>{eventLabels[event.type]} {event.player ? `- ${event.player}` : ""}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-500">{event.team}</span>
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
