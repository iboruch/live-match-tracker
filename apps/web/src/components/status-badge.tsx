import clsx from "clsx";
import { MatchStatus } from "@/types";

const labels: Record<MatchStatus, string> = {
  scheduled: "Scheduled",
  live: "Live",
  finished: "Finished"
};

export function StatusBadge({ status }: { status: MatchStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded px-2 py-1 text-xs font-semibold",
        status === "live" && "bg-emerald-100 text-emerald-700",
        status === "scheduled" && "bg-slate-200 text-slate-700",
        status === "finished" && "bg-zinc-900 text-white"
      )}
    >
      {labels[status]}
    </span>
  );
}
