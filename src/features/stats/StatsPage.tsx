import { useEffect, useState } from "react";
import { MetricBox } from "../../components/common/MetricBox";
import { statsFor } from "../../domain/metrics";
import type { ActiveChallengeState } from "../../domain/types";
import { getStatsInputs } from "../../storage/repository";

type Stats = ReturnType<typeof statsFor>;

export function StatsPage({ state }: { state: ActiveChallengeState }) {
  const [stats, setStats] = useState<Stats>();

  useEffect(() => {
    void getStatsInputs(state.challenge.id).then(({ days, journals, photos }) => setStats(statsFor(state.challenge, days, journals, photos)));
  }, [state.challenge]);

  if (!stats) {
    return <main className="px-5 py-8 label-caps text-muted">Loading stats</main>;
  }

  return (
    <main className="space-y-8 px-5 py-8">
      <section className="grid grid-cols-2 gap-4">
        <MetricBox label="Current day" value={stats.currentDay} suffix="/ 75" accent />
        <MetricBox label="Completed" value={stats.completed} suffix="days" />
        <MetricBox label="Current streak" value={stats.currentStreak} suffix="days" />
        <MetricBox label="Longest streak" value={stats.longestStreak} suffix="days" />
        <MetricBox label="Missed" value={stats.missed} suffix="days" />
        <MetricBox label="Proofs" value={stats.photos} suffix="photos" />
      </section>
      <section className="hard-card p-5 space-y-4">
        <h2 className="font-mono text-2xl font-extrabold uppercase">Journal signals</h2>
        <Row label="Journal entries" value={stats.journals} />
        <Row label="Average mood" value={stats.averageMood ? `${stats.averageMood} / 5` : "-"} />
        <Row label="Average difficulty" value={stats.averageDifficulty ? `${stats.averageDifficulty} / 5` : "-"} />
        <Row label="Projected finish" value={stats.finishDate} />
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-outline pb-3">
      <span className="label-caps text-muted">{label}</span>
      <span className="font-mono font-bold">{value}</span>
    </div>
  );
}
