import { AlertTriangle, Camera, Check, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TASKS } from "../../domain/constants";
import { canCompleteDay, completedTaskCount } from "../../domain/metrics";
import type { ActiveChallengeState, JournalEntry } from "../../domain/types";
import { blobUrl } from "../../storage/images";
import { completeDay, saveJournal, savePhoto, setTask } from "../../storage/repository";
import { RatingControl } from "../../components/common/RatingControl";

export function TodayPage({ state, onChange }: { state: ActiveChallengeState; onChange: () => Promise<void> }) {
  const { today } = state;
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [loadedDayId, setLoadedDayId] = useState(today.day.id);
  const [savedJournal, setSavedJournal] = useState(() => getJournalForm(today.journal));
  const [journal, setJournal] = useState(() => getJournalForm(today.journal));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const completeCount = completedTaskCount(today);
  const ready = canCompleteDay(today);
  const completed = today.day.status === "complete";
  const hasUnsavedJournal = !completed && JSON.stringify(journal) !== JSON.stringify(savedJournal);

  useEffect(() => {
    const url = blobUrl(today.photo?.imageBlob);
    setPhotoUrl(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [today.photo]);

  useEffect(() => {
    if (today.day.id !== loadedDayId) {
      const nextJournal = getJournalForm(today.journal);
      setLoadedDayId(today.day.id);
      setSavedJournal(nextJournal);
      setJournal(nextJournal);
      setSaveState("idle");
    }
  }, [loadedDayId, today.day.id, today.journal]);

  const saveJournalNow = async () => {
    if (!hasUnsavedJournal) return;
    setSaveState("saving");
    const normalizedJournal = normalizeJournalForm(journal);
    await saveJournal(today.day.id, cleanJournal(normalizedJournal));
    setJournal(normalizedJournal);
    setSavedJournal(normalizedJournal);
    await onChange();
    setSaveState("saved");
    window.setTimeout(() => setSaveState("idle"), 1200);
  };

  const discardJournalChanges = () => {
    setJournal(savedJournal);
    setSaveState("idle");
  };

  return (
    <main className="space-y-8 px-5 py-8">
      {hasUnsavedJournal ? <UnsavedJournalModal onDiscard={discardJournalChanges} onSave={() => void saveJournalNow()} saving={saveState === "saving"} /> : null}
      <section className="hard-card p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="label-caps text-muted">Progress</p>
            <h2 className="font-mono text-4xl font-extrabold">{completeCount} / {today.tasks.length}</h2>
          </div>
          <p className="label-caps text-orange">{Math.round((completeCount / today.tasks.length) * 100)}%</p>
        </div>
        <div className="mt-4 h-3 border border-primary">
          <div className="h-full bg-orange" style={{ width: `${(completeCount / today.tasks.length) * 100}%` }} />
        </div>
      </section>

      <section>
        <h2 className="label-caps mb-3 text-muted">Checklist</h2>
        <div className="border-t border-primary">
          {today.tasks.map((task) => {
            const tone = TASKS.find((item) => item.key === task.taskKey)?.tone ?? "green";
            return (
              <label key={task.id} className="flex min-h-16 cursor-pointer items-center justify-between border-b border-primary py-3">
                <span className={`label-caps pr-4 ${task.completed ? "text-muted line-through" : "text-primary"}`}>{task.label}</span>
                <input className="sr-only" type="checkbox" checked={task.completed} disabled={completed || task.taskKey === "progressPhoto"} onChange={(event) => void setTask(today.day.id, task.taskKey, event.target.checked).then(onChange)} />
                <span className={`grid h-8 w-8 place-items-center border-2 border-primary ${task.completed ? toneClass(tone) : ""}`}>
                  {task.completed ? <Check size={18} /> : null}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="label-caps text-muted">Daily proof photo</h2>
        <label className="focus-ring relative flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center overflow-hidden border-2 border-primary bg-surface">
          {photoUrl ? <img alt="Today progress proof" className="h-full w-full object-cover" src={photoUrl} /> : <PhotoEmpty />}
          {!completed ? <input accept="image/*" capture="environment" className="sr-only" type="file" onChange={(event) => void handlePhoto(event.currentTarget.files?.[0], today.day.id, onChange)} /> : null}
        </label>
        <p className="text-sm text-muted">Photos are stored only on this device.</p>
      </section>

      <section className="space-y-4">
        <h2 className="label-caps text-muted">End-of-day journal</h2>
        <textarea
          className="focus-ring min-h-36 w-full border-2 border-primary bg-background p-4 text-primary placeholder:text-muted"
          placeholder="How did today go?"
          value={journal.text}
          disabled={completed}
          onChange={(event) => setJournal((current) => ({ ...current, text: event.target.value }))}
        />
        <div className="space-y-4">
          <RatingControl label="Mood" lowLabel="Low" highLabel="Strong" value={journal.moodRating} onChange={(value) => setJournal((current) => ({ ...current, moodRating: value }))} />
          <RatingControl label="Energy" lowLabel="Drained" highLabel="Charged" value={journal.energyRating} onChange={(value) => setJournal((current) => ({ ...current, energyRating: value }))} />
          <RatingControl label="Difficulty" lowLabel="Easy" highLabel="Hard" value={journal.difficultyRating} onChange={(value) => setJournal((current) => ({ ...current, difficultyRating: value }))} />
          <input
            className="focus-ring w-full border-b-2 border-primary bg-background py-3 text-primary placeholder:text-muted"
            placeholder="Weight (optional)"
            value={journal.weight}
            disabled={completed}
            onChange={(event) => setJournal((current) => ({ ...current, weight: event.target.value }))}
          />
        </div>
        {!completed ? (
          <button className={`focus-ring w-full border-2 py-4 label-caps transition-colors ${saveButtonClass(saveState, hasUnsavedJournal)}`} onClick={saveJournalNow} disabled={saveState === "saving" || !hasUnsavedJournal}>
            {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Save journal"}
          </button>
        ) : null}
      </section>

      <section className="space-y-3 pb-6">
        {completed ? (
          <Link className="focus-ring flex w-full items-center justify-center gap-3 bg-primary py-5 label-caps text-background shadow-hard" to={`/recap/${today.day.dayNumber}`}>
            <Share2 size={18} />
            Share recap
          </Link>
        ) : (
          <button
            className="focus-ring w-full bg-primary py-5 label-caps text-background shadow-hard disabled:opacity-40"
            disabled={!ready || hasUnsavedJournal}
            onClick={async () => {
              await completeDay(today.day.id);
              await onChange();
            }}
          >
            Complete day {today.day.dayNumber}
          </button>
        )}
        {hasUnsavedJournal ? <p className="text-center text-sm text-orange">Save or discard journal edits before completing the day.</p> : null}
        {!ready && !completed ? <p className="text-center text-sm text-muted">Complete every checklist item and upload a photo before closing the day.</p> : null}
      </section>
    </main>
  );
}

function UnsavedJournalModal({ saving, onDiscard, onSave }: { saving: boolean; onDiscard: () => void; onSave: () => void }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[100] px-5 pt-3" role="dialog" aria-label="Unsaved journal changes">
      <div className="mx-auto flex max-w-lg items-center gap-3 border-2 border-orange bg-background p-4 shadow-hard-orange">
        <AlertTriangle className="shrink-0 text-orange" size={20} />
        <div className="min-w-0 flex-1">
          <p className="label-caps text-primary">Unsaved changes</p>
          <p className="text-xs text-muted">Save or discard your journal edits.</p>
        </div>
        <button className="label-caps text-muted" type="button" onClick={onDiscard}>
          Discard
        </button>
        <button className="bg-orange px-3 py-2 label-caps text-background disabled:opacity-60" type="button" disabled={saving} onClick={onSave}>
          {saving ? "Saving" : "Save"}
        </button>
      </div>
    </div>
  );
}

function PhotoEmpty() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Camera size={44} className="text-muted" />
      <span className="label-caps text-muted">Upload proof</span>
    </div>
  );
}

function toneClass(tone: "green" | "orange" | "blue") {
  return tone === "orange" ? "bg-orange text-background" : tone === "blue" ? "bg-blue text-primary" : "bg-success text-background";
}

async function handlePhoto(file: File | undefined, dayId: string, onChange: () => Promise<void>) {
  if (!file) return;
  await savePhoto(dayId, file);
  await onChange();
}

function cleanJournal(input: { text: string; moodRating?: number; energyRating?: number; difficultyRating?: number; weight: string }): Omit<JournalEntry, "id" | "challengeDayId" | "createdAt" | "updatedAt"> {
  return {
    text: input.text.trim(),
    moodRating: input.moodRating,
    energyRating: input.energyRating,
    difficultyRating: input.difficultyRating,
    weight: input.weight.trim() || undefined
  };
}

function getJournalForm(journal?: JournalEntry) {
  return {
    text: journal?.text ?? "",
    moodRating: journal?.moodRating,
    energyRating: journal?.energyRating,
    difficultyRating: journal?.difficultyRating,
    weight: journal?.weight ?? ""
  };
}

function normalizeJournalForm(input: ReturnType<typeof getJournalForm>) {
  return {
    text: input.text.trim(),
    moodRating: input.moodRating,
    energyRating: input.energyRating,
    difficultyRating: input.difficultyRating,
    weight: input.weight.trim()
  };
}

function saveButtonClass(saveState: "idle" | "saving" | "saved", hasUnsavedJournal: boolean) {
  if (saveState === "saving") return "border-orange bg-orange text-background";
  if (saveState === "saved") return "border-success bg-success text-background";
  if (!hasUnsavedJournal) return "border-outline text-muted opacity-60";
  return "border-primary text-primary active:bg-primary active:text-background";
}
