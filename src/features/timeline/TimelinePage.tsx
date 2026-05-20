import { Link } from "react-router-dom";
import { getDayStatus } from "../../domain/metrics";
import type { ActiveChallengeState } from "../../domain/types";

export function TimelinePage({ state }: { state: ActiveChallengeState }) {
  return (
    <main className="space-y-8 px-5 py-8">
      <section className="hard-card p-5">
        <p className="label-caps text-muted">Chronicle</p>
        <h1 className="font-mono text-4xl font-extrabold uppercase">{state.days.filter((day) => day.status === "complete").length} complete</h1>
      </section>
      <section className="grid grid-cols-5 gap-3">
        {state.days.map((day) => {
          const status = getDayStatus(day, state.challenge);
          return (
            <Link key={day.id} className={`relative grid aspect-square place-items-center border-2 font-mono text-sm font-extrabold ${statusClass(status)}`} to={`/day/${day.dayNumber}`}>
              <span className="absolute left-1 top-1 text-[10px]">D{day.dayNumber}</span>
              <span>{labelFor(status)}</span>
            </Link>
          );
        })}
      </section>
      <section className="grid grid-cols-2 gap-3 text-sm text-muted">
        <Legend color="bg-success" label="Complete" />
        <Legend color="bg-orange" label="Current" />
        <Legend color="bg-danger" label="Missed" />
        <Legend color="bg-surface" label="Future" />
      </section>
    </main>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-4 w-4 border border-primary ${color}`} />
      <span className="label-caps">{label}</span>
    </div>
  );
}

function labelFor(status: string) {
  if (status === "complete") return "OK";
  if (status === "missed") return "X";
  if (status === "in_progress") return "!";
  return "";
}

function statusClass(status: string) {
  if (status === "complete") return "border-success bg-success text-background";
  if (status === "missed") return "border-danger bg-danger text-primary";
  if (status === "in_progress") return "border-orange bg-orange text-background shadow-hard";
  return "border-outline bg-surface text-muted";
}
