import { ShieldCheck } from "lucide-react";
import { acceptStorageWarning, startChallenge } from "../../storage/repository";

export function OnboardingPage({ onReady }: { onReady: () => Promise<void> }) {
  const handleStart = async () => {
    await acceptStorageWarning();
    await startChallenge();
    await onReady();
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-between px-5 py-8 text-primary">
      <section className="space-y-8">
        <div className="border-b-2 border-primary pb-6">
          <p className="label-caps text-orange">Private 75 Hard log</p>
          <h1 className="mt-3 font-mono text-5xl font-extrabold uppercase leading-none">im hard</h1>
        </div>
        <div className="hard-card p-5">
          <ShieldCheck className="mb-4 text-orange" size={36} />
          <h2 className="font-mono text-2xl font-extrabold uppercase">Stored on this device</h2>
          <p className="mt-3 leading-7 text-muted">
            Your checklist, photos, and journal stay in this browser. Nothing is uploaded to a server. Clearing browser data, using private browsing, or switching devices can remove progress.
          </p>
        </div>
      </section>
      <button className="focus-ring w-full bg-primary px-5 py-5 label-caps text-background shadow-hard active:translate-x-1 active:translate-y-1 active:shadow-none" onClick={handleStart}>
        Start challenge
      </button>
    </main>
  );
}
