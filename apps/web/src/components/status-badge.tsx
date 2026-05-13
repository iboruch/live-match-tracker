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
        "inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold",
        status === "live" && "bg-emerald-100 text-emerald-700",
        status === "scheduled" && "bg-amber-100 text-amber-800",
        status === "finished" && "bg-zinc-900 text-white"
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          status === "live" && "bg-emerald-500",
          status === "scheduled" && "bg-amber-500",
          status === "finished" && "bg-zinc-400"
        )}
      />
      {labels[status]}
    </span>
  );
}
