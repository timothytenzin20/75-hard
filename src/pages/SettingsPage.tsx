import { RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ActiveChallengeState } from "../domain/types";
import { restartChallenge } from "../storage/repository";

export function SettingsPage({ state, onChange }: { state: ActiveChallengeState; onChange: () => Promise<void> }) {
  const navigate = useNavigate();
  return (
    <main className="space-y-8 px-5 py-8">
      <section className="hard-card p-5">
        <p className="label-caps text-orange">Settings</p>
        <h1 className="font-mono text-4xl font-extrabold uppercase">Local log</h1>
        <p className="mt-4 leading-7 text-muted">
          Your progress is stored only in this browser on this device. Nothing is uploaded to a server. Clearing browser data may remove your progress.
        </p>
      </section>
      <section className="hard-card p-5 space-y-3">
        <p className="label-caps text-muted">Active challenge</p>
        <p>Started {state.challenge.startDate}</p>
        <p>Ends {state.challenge.endDate}</p>
      </section>
      <button
        className="focus-ring flex w-full items-center justify-center gap-3 bg-danger py-5 label-caps text-primary"
        onClick={async () => {
          await restartChallenge(state.today.day.dayNumber);
          await onChange();
          navigate("/today");
        }}
      >
        <RotateCcw size={18} />
        Restart from day 1
      </button>
    </main>
  );
}
