import { Download, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { MetricBox } from "../../components/common/MetricBox";
import { statsFor } from "../../domain/metrics";
import type { ActiveChallengeState } from "../../domain/types";
import { exportBackup, getStatsInputs, importBackup } from "../../storage/repository";

type Stats = ReturnType<typeof statsFor>;

export function StatsPage({ state, onChange }: { state: ActiveChallengeState; onChange: () => Promise<void> }) {
  const [stats, setStats] = useState<Stats>();
  const [backupStatus, setBackupStatus] = useState("");

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
      <section className="hard-card space-y-4 p-5">
        <div>
          <p className="label-caps text-orange">Local backup</p>
          <h2 className="font-mono text-2xl font-extrabold uppercase">Save or restore</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Export a local backup file to your phone, or upload a previous backup to repopulate this app.</p>
        </div>
        <button className="focus-ring flex w-full items-center justify-center gap-3 bg-primary py-4 label-caps text-background" onClick={() => void handleExport(setBackupStatus)}>
          <Download size={18} />
          Export data
        </button>
        <label className="focus-ring flex w-full cursor-pointer items-center justify-center gap-3 border-2 border-primary py-4 label-caps text-primary">
          <Upload size={18} />
          Upload backup
          <input
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={(event) => void handleImport(event.currentTarget.files?.[0], onChange, setBackupStatus)}
          />
        </label>
        {backupStatus ? <p className="label-caps text-orange">{backupStatus}</p> : null}
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

async function handleExport(setBackupStatus: (value: string) => void) {
  setBackupStatus("Preparing backup...");
  const blob = await exportBackup();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `im-hard-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  setBackupStatus("Backup downloaded");
}

async function handleImport(file: File | undefined, onChange: () => Promise<void>, setBackupStatus: (value: string) => void) {
  if (!file) return;
  try {
    setBackupStatus("Restoring backup...");
    await importBackup(file);
    await onChange();
    setBackupStatus("Backup restored");
  } catch (error) {
    setBackupStatus(error instanceof Error ? error.message : "Backup import failed");
  }
}
