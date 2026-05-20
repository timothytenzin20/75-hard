import { AlertTriangle, Camera, Check, Share2 } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Link } from "react-router-dom";
import { TASKS } from "../../domain/constants";
import { canCompleteDay, completedTaskCount } from "../../domain/metrics";
import type { ActiveChallengeState, JournalEntry, TaskCompletion } from "../../domain/types";
import { blobUrl } from "../../storage/images";
import { completeDay, saveJournal, savePhoto, setDayCompletionFromRequirements, setTask } from "../../storage/repository";
import { RatingControl } from "../../components/common/RatingControl";

export function TodayPage({ state, onChange }: { state: ActiveChallengeState; onChange: () => Promise<void> }) {
  const { today } = state;
  const [savedPhotoUrl, setSavedPhotoUrl] = useState<string>();
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File>();
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string>();
  const [loadedDayId, setLoadedDayId] = useState(today.day.id);
  const [savedTasks, setSavedTasks] = useState(() => today.tasks);
  const [tasks, setTasks] = useState(() => today.tasks);
  const [savedJournal, setSavedJournal] = useState(() => getJournalForm(today.journal));
  const [journal, setJournal] = useState(() => getJournalForm(today.journal));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const pendingRecord = { ...today, tasks };
  const completeCount = completedTaskCount(pendingRecord);
  const ready = canCompleteDay(pendingRecord);
  const completed = today.day.status === "complete";
  const hasUnsavedTasks = !sameTasks(tasks, savedTasks);
  const hasUnsavedJournal = JSON.stringify(journal) !== JSON.stringify(savedJournal);
  const hasUnsavedPhoto = Boolean(pendingPhotoFile);
  const hasUnsavedChanges = hasUnsavedTasks || hasUnsavedJournal || hasUnsavedPhoto;
  const photoUrl = pendingPhotoUrl ?? savedPhotoUrl;

  useEffect(() => {
    const url = blobUrl(today.photo?.imageBlob);
    setSavedPhotoUrl(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [today.photo]);

  useEffect(() => {
    return () => {
      if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
    };
  }, [pendingPhotoUrl]);

  useEffect(() => {
    if (today.day.id !== loadedDayId) {
      const nextJournal = getJournalForm(today.journal);
      setLoadedDayId(today.day.id);
      setSavedTasks(today.tasks);
      setTasks(today.tasks);
      setSavedJournal(nextJournal);
      setJournal(nextJournal);
      setPendingPhotoFile(undefined);
      setPendingPhotoUrl(undefined);
      setSaveState("idle");
    }
  }, [loadedDayId, today.day.id, today.journal, today.tasks]);

  const saveChangesNow = async () => {
    if (!hasUnsavedChanges) return;
    setSaveState("saving");
    const normalizedJournal = normalizeJournalForm(journal);
    if (hasUnsavedTasks) {
      await Promise.all(
        tasks
          .filter((task) => task.completed !== savedTasks.find((savedTask) => savedTask.taskKey === task.taskKey)?.completed)
          .map((task) => setTask(today.day.id, task.taskKey, task.completed, { preserveDayStatus: completed }))
      );
    }
    if (pendingPhotoFile) {
      await savePhoto(today.day.id, pendingPhotoFile, { preserveDayStatus: completed });
    }
    if (hasUnsavedJournal) {
      await saveJournal(today.day.id, cleanJournal(normalizedJournal), { preserveDayStatus: completed });
    }
    if (completed && (hasUnsavedTasks || pendingPhotoFile)) {
      await setDayCompletionFromRequirements(today.day.id, canCompleteDay({ ...today, tasks }));
    }
    setSavedTasks(tasks);
    setJournal(normalizedJournal);
    setSavedJournal(normalizedJournal);
    await onChange();
    setPendingPhotoFile(undefined);
    setPendingPhotoUrl(undefined);
    setSaveState("saved");
    window.setTimeout(() => setSaveState("idle"), 1200);
  };

  const discardChanges = () => {
    setTasks(savedTasks);
    setJournal(savedJournal);
    setPendingPhotoFile(undefined);
    setPendingPhotoUrl(undefined);
    setSaveState("idle");
  };

  return (
    <main className="space-y-8 px-5 py-8">
      {hasUnsavedChanges ? <UnsavedChangesModal onDiscard={discardChanges} onSave={() => void saveChangesNow()} saving={saveState === "saving"} completed={completed} /> : null}
      <section className="hard-card p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="label-caps text-muted">Progress</p>
            <h2 className="font-mono text-4xl font-extrabold">{completeCount} / {tasks.length}</h2>
          </div>
          <p className="label-caps text-orange">{Math.round((completeCount / tasks.length) * 100)}%</p>
        </div>
        <div className="mt-4 h-3 border border-primary">
          <div className="h-full bg-orange" style={{ width: `${(completeCount / tasks.length) * 100}%` }} />
        </div>
      </section>

      <section>
        <h2 className="label-caps mb-3 text-muted">Checklist</h2>
        <div className="border-t border-primary">
          {tasks.map((task) => {
            const tone = TASKS.find((item) => item.key === task.taskKey)?.tone ?? "green";
            return (
              <label key={task.id} className="flex min-h-16 cursor-pointer items-center justify-between border-b border-primary py-3">
                <span className={`label-caps pr-4 ${task.completed ? "text-muted line-through" : "text-primary"}`}>{task.label}</span>
                <input className="sr-only" type="checkbox" checked={task.completed} disabled={task.taskKey === "progressPhoto"} onChange={(event) => updateTask(task.id, event.target.checked, setTasks)} />
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
          <input accept="image/*" capture="environment" className="sr-only" type="file" onChange={(event) => selectPhoto(event.currentTarget.files?.[0], setPendingPhotoFile, setPendingPhotoUrl, setTasks)} />
        </label>
        <p className="text-sm text-muted">Photos are stored only on this device.</p>
      </section>

      <section className="space-y-4">
        <h2 className="label-caps text-muted">End-of-day journal</h2>
        <textarea
          className="focus-ring min-h-36 w-full border-2 border-primary bg-background p-4 text-primary placeholder:text-muted"
          placeholder="How did today go?"
          value={journal.text}
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
            onChange={(event) => setJournal((current) => ({ ...current, weight: event.target.value }))}
          />
        </div>
        <button className={`focus-ring w-full border-2 py-4 label-caps transition-colors ${saveButtonClass(saveState, hasUnsavedChanges)}`} onClick={saveChangesNow} disabled={saveState === "saving" || !hasUnsavedChanges}>
          {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : completed ? "Save changes" : "Save journal"}
        </button>
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
            disabled={!ready || hasUnsavedChanges}
            onClick={async () => {
              await completeDay(today.day.id);
              await onChange();
            }}
          >
            Complete day {today.day.dayNumber}
          </button>
        )}
        {hasUnsavedChanges ? <p className="text-center text-sm text-orange">Save or discard changes before completing the day.</p> : null}
        {!ready && !completed ? <p className="text-center text-sm text-muted">Complete every checklist item and upload a photo before closing the day.</p> : null}
      </section>
    </main>
  );
}

function UnsavedChangesModal({ saving, completed, onDiscard, onSave }: { saving: boolean; completed: boolean; onDiscard: () => void; onSave: () => void }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[100] px-5 pt-3" role="dialog" aria-label="Unsaved journal changes">
      <div className="mx-auto flex max-w-lg items-center gap-3 border-2 border-orange bg-background p-4 shadow-hard-orange">
        <AlertTriangle className="shrink-0 text-orange" size={20} />
        <div className="min-w-0 flex-1">
          <p className="label-caps text-primary">Unsaved changes</p>
          <p className="text-xs text-muted">{completed ? "Save to overwrite today's data, or discard." : "Save or discard today's edits."}</p>
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

function updateTask(taskId: string, completed: boolean, setTasks: Dispatch<SetStateAction<TaskCompletion[]>>) {
  setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, completed } : task)));
}

function selectPhoto(
  file: File | undefined,
  setPendingPhotoFile: Dispatch<SetStateAction<File | undefined>>,
  setPendingPhotoUrl: Dispatch<SetStateAction<string | undefined>>,
  setTasks: Dispatch<SetStateAction<TaskCompletion[]>>,
) {
  if (!file) return;
  setPendingPhotoFile(file);
  setPendingPhotoUrl((current) => {
    if (current) URL.revokeObjectURL(current);
    return URL.createObjectURL(file);
  });
  const markPhotoComplete = (current: TaskCompletion[]) => current.map((task) => (task.taskKey === "progressPhoto" ? { ...task, completed: true } : task));
  setTasks(markPhotoComplete);
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

function sameTasks(left: TaskCompletion[], right: TaskCompletion[]) {
  return left.every((task) => task.completed === right.find((savedTask) => savedTask.taskKey === task.taskKey)?.completed);
}
