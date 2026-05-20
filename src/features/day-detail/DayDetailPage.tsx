import { AlertTriangle, ArrowLeft, Camera, Check, ChevronLeft, ChevronRight, Image, Pencil, Share2 } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TASKS } from "../../domain/constants";
import { currentDayNumber, formatShortDate } from "../../domain/dates";
import { canCompleteDay, completedTaskCount, getDayStatus } from "../../domain/metrics";
import type { ActiveChallengeState, DayRecord, JournalEntry, TaskCompletion } from "../../domain/types";
import { previewImageUrl } from "../../storage/images";
import { clearDraftPhoto, getDayRecord, getDraftPhoto, promoteDraftPhoto, saveDraftPhoto, saveJournal, setDayStatusFromRequirements, setTask } from "../../storage/repository";
import { RatingControl } from "../../components/common/RatingControl";

export function DayDetailPage({ state, onChange }: { state: ActiveChallengeState; onChange: () => Promise<void> }) {
  const params = useParams();
  const navigate = useNavigate();
  const day = state.days.find((item) => item.dayNumber === Number(params.dayNumber));
  const [record, setRecord] = useState<DayRecord>();
  const [savedPhotoUrl, setSavedPhotoUrl] = useState<string>();
  const [pendingPhotoDraft, setPendingPhotoDraft] = useState(false);
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string>();
  const [editMode, setEditMode] = useState(false);
  const [savedTasks, setSavedTasks] = useState<TaskCompletion[]>([]);
  const [tasks, setTasks] = useState<TaskCompletion[]>([]);
  const [savedJournal, setSavedJournal] = useState(getJournalForm());
  const [journal, setJournal] = useState(getJournalForm());
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    if (!day) return;
    void getDayRecord(day.id).then((nextRecord) => {
      setRecord(nextRecord);
      setSavedTasks(nextRecord.tasks);
      setTasks(nextRecord.tasks);
      setSavedJournal(getJournalForm(nextRecord.journal));
      setJournal(getJournalForm(nextRecord.journal));
      setPendingPhotoDraft(false);
      setPendingPhotoUrl(undefined);
      setSaveState("idle");
    });
  }, [day]);

  useEffect(() => {
    let disposed = false;
    void (async () => {
      const url = record?.photo?.imageBlob ? await previewImageUrl(record.photo.imageBlob) : undefined;
      if (disposed) {
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        return;
      }
      setSavedPhotoUrl(url);
    })();
    return () => {
      disposed = true;
    };
  }, [record?.photo]);

  useEffect(() => {
    if (!day) return;
    let disposed = false;
    void (async () => {
      const draft = await getDraftPhoto(day.id);
      if (!draft) return;
      const url = await previewImageUrl(draft.imageBlob);
      if (disposed) {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        return;
      }
      setPendingPhotoDraft(true);
      setPendingPhotoUrl(url);
      setTasks((current) => current.map((task) => (task.taskKey === "progressPhoto" ? { ...task, completed: true } : task)));
    })();
    return () => {
      disposed = true;
    };
  }, [day]);

  useEffect(() => {
    return () => {
      if (pendingPhotoUrl?.startsWith("blob:")) URL.revokeObjectURL(pendingPhotoUrl);
    };
  }, [pendingPhotoUrl]);

  if (!day || !record) {
    return (
      <main className="px-5 py-8">
        <button className="label-caps text-orange" onClick={() => navigate("/timeline")}>Back</button>
      </main>
    );
  }

  const status = getDayStatus(day, state.challenge);
  const editable = day.dayNumber <= currentDayNumber(state.challenge.startDate);
  const hasUnsavedTasks = !sameTasks(tasks, savedTasks);
  const hasUnsavedJournal = JSON.stringify(journal) !== JSON.stringify(savedJournal);
  const hasUnsavedPhoto = pendingPhotoDraft;
  const hasUnsavedChanges = hasUnsavedTasks || hasUnsavedJournal || hasUnsavedPhoto;
  const photoUrl = pendingPhotoUrl ?? savedPhotoUrl;
  const workingRecord = { ...record, tasks };

  const saveChanges = async () => {
    if (!hasUnsavedChanges) return;
    setSaveState("saving");
    const normalizedJournal = normalizeJournalForm(journal);
    if (hasUnsavedTasks) {
      await Promise.all(
        tasks
          .filter((task) => task.completed !== savedTasks.find((savedTask) => savedTask.taskKey === task.taskKey)?.completed)
          .map((task) => setTask(day.id, task.taskKey, task.completed, { preserveDayStatus: true }))
      );
    }
    if (pendingPhotoDraft) {
      await promoteDraftPhoto(day.id, { preserveDayStatus: true });
    }
    if (hasUnsavedJournal) {
      await saveJournal(day.id, cleanJournal(normalizedJournal), { preserveDayStatus: true });
    }
    await setDayStatusFromRequirements(day.id, canCompleteDay({ ...record, tasks }));
    await onChange();
    const nextRecord = await getDayRecord(day.id);
    setRecord(nextRecord);
    setSavedTasks(nextRecord.tasks);
    setTasks(nextRecord.tasks);
    setSavedJournal(getJournalForm(nextRecord.journal));
    setJournal(getJournalForm(nextRecord.journal));
    setPendingPhotoDraft(false);
    setPendingPhotoUrl(undefined);
    setSaveState("saved");
    window.setTimeout(() => setSaveState("idle"), 1200);
  };

  const discardChanges = () => {
    setTasks(savedTasks);
    setJournal(savedJournal);
    void clearDraftPhoto(day.id);
    setPendingPhotoDraft(false);
    setPendingPhotoUrl(undefined);
    setSaveState("idle");
  };

  return (
    <main className="space-y-8 px-5 py-8">
      {hasUnsavedChanges ? <UnsavedChangesModal onDiscard={discardChanges} onSave={() => void saveChanges()} saving={saveState === "saving"} /> : null}
      <div className="flex items-center justify-between gap-3">
        <button className="focus-ring flex items-center gap-2 label-caps text-muted" onClick={() => navigate("/timeline")}>
          <ArrowLeft size={18} />
          Timeline
        </button>
        <div className="flex gap-2">
          <button className="focus-ring border border-primary p-2 disabled:opacity-40" disabled={day.dayNumber <= 1 || hasUnsavedChanges} onClick={() => navigate(`/day/${day.dayNumber - 1}`)} aria-label="Previous day">
            <ChevronLeft size={18} />
          </button>
          <button className="focus-ring border border-primary p-2 disabled:opacity-40" disabled={day.dayNumber >= 75 || hasUnsavedChanges} onClick={() => navigate(`/day/${day.dayNumber + 1}`)} aria-label="Next day">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <section className="hard-card p-5">
        <p className="label-caps text-orange">{formatShortDate(day.date)}</p>
        <h1 className="font-mono text-4xl font-extrabold uppercase">Day {day.dayNumber}</h1>
        <p className="label-caps mt-2 text-muted">Status: {status.replace("_", " ")}</p>
        <p className="label-caps mt-2 text-muted">{completedTaskCount(workingRecord)} / {tasks.length} complete</p>
      </section>

      {editable ? (
        <button className="focus-ring flex w-full items-center justify-center gap-3 border-2 border-primary py-4 label-caps text-primary" onClick={() => setEditMode((current) => !current)}>
          <Pencil size={18} />
          {editMode ? "View mode" : "Edit day"}
        </button>
      ) : (
        <p className="label-caps text-muted">Future day locked</p>
      )}

      {editMode && editable ? (
        <DayEditor
          tasks={tasks}
          journal={journal}
          photoUrl={photoUrl}
          saveState={saveState}
          hasUnsavedChanges={hasUnsavedChanges}
          onTaskChange={(taskId, completed) => updateTask(taskId, completed, setTasks)}
          onJournalChange={setJournal}
          onPhotoSelect={(file) => void selectPhoto(file, day.id, setPendingPhotoDraft, setPendingPhotoUrl, setTasks)}
          onSave={() => void saveChanges()}
        />
      ) : (
        <ReadOnlyDay record={record} photoUrl={photoUrl} />
      )}

      {status === "complete" ? (
        <Link className="focus-ring flex w-full items-center justify-center gap-3 bg-primary py-5 label-caps text-background shadow-hard" to={`/recap/${day.dayNumber}`}>
          <Share2 size={18} />
          Share proof
        </Link>
      ) : null}
    </main>
  );
}

function DayEditor({
  tasks,
  journal,
  photoUrl,
  saveState,
  hasUnsavedChanges,
  onTaskChange,
  onJournalChange,
  onPhotoSelect,
  onSave
}: {
  tasks: TaskCompletion[];
  journal: ReturnType<typeof getJournalForm>;
  photoUrl?: string;
  saveState: "idle" | "saving" | "saved";
  hasUnsavedChanges: boolean;
  onTaskChange: (taskId: string, completed: boolean) => void;
  onJournalChange: Dispatch<SetStateAction<ReturnType<typeof getJournalForm>>>;
  onPhotoSelect: (file?: File) => void;
  onSave: () => void;
}) {
  return (
    <>
      <section>
        <h2 className="label-caps mb-3 text-muted">Checklist</h2>
        <div className="border-t border-primary">
          {tasks.map((task) => {
            const tone = TASKS.find((item) => item.key === task.taskKey)?.tone ?? "green";
            return (
              <label key={task.id} className="flex min-h-16 cursor-pointer items-center justify-between border-b border-primary py-3">
                <span className={`label-caps pr-4 ${task.completed ? "text-muted line-through" : "text-primary"}`}>{task.label}</span>
                <input className="sr-only" type="checkbox" checked={task.completed} disabled={task.taskKey === "progressPhoto"} onChange={(event) => onTaskChange(task.id, event.target.checked)} />
                <span className={`grid h-8 w-8 place-items-center border-2 border-primary ${task.completed ? toneClass(tone) : ""}`}>
                  {task.completed ? <Check size={18} /> : null}
                </span>
              </label>
            );
          })}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="label-caps text-muted">Proof photo</h2>
        <div className="relative flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden border-2 border-primary bg-surface">
          {photoUrl ? <img alt="Day proof" className="h-full w-full object-cover" src={photoUrl} /> : <PhotoEmpty />}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <PhotoPicker capture label="Camera" icon={<Camera size={18} />} onPhotoSelect={onPhotoSelect} />
          <PhotoPicker label="Library" icon={<Image size={18} />} onPhotoSelect={onPhotoSelect} />
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="label-caps text-muted">Journal</h2>
        <textarea className="focus-ring min-h-36 w-full border-2 border-primary bg-background p-4 text-primary placeholder:text-muted" placeholder="How did today go?" value={journal.text} onChange={(event) => onJournalChange((current) => ({ ...current, text: event.target.value }))} />
        <RatingControl label="Mood" lowLabel="Low" highLabel="Strong" value={journal.moodRating} onChange={(value) => onJournalChange((current) => ({ ...current, moodRating: value }))} />
        <RatingControl label="Energy" lowLabel="Drained" highLabel="Charged" value={journal.energyRating} onChange={(value) => onJournalChange((current) => ({ ...current, energyRating: value }))} />
        <RatingControl label="Difficulty" lowLabel="Easy" highLabel="Hard" value={journal.difficultyRating} onChange={(value) => onJournalChange((current) => ({ ...current, difficultyRating: value }))} />
        <input className="focus-ring w-full border-b-2 border-primary bg-background py-3 text-primary placeholder:text-muted" placeholder="Weight (optional)" value={journal.weight} onChange={(event) => onJournalChange((current) => ({ ...current, weight: event.target.value }))} />
        <button className={`focus-ring w-full border-2 py-4 label-caps transition-colors ${saveButtonClass(saveState, hasUnsavedChanges)}`} disabled={saveState === "saving" || !hasUnsavedChanges} onClick={onSave}>
          {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Save day"}
        </button>
      </section>
    </>
  );
}

function ReadOnlyDay({ record, photoUrl }: { record: DayRecord; photoUrl?: string }) {
  return (
    <>
      <section className="aspect-[4/5] overflow-hidden border-2 border-primary bg-surface">
        {photoUrl ? <img className="h-full w-full object-cover" src={photoUrl} alt={`Day ${record.day.dayNumber} proof`} /> : <div className="grid h-full place-items-center label-caps text-muted">No photo</div>}
      </section>
      <section>
        <h2 className="label-caps mb-3 text-muted">Checklist results</h2>
        <div className="border-t border-primary">
          {record.tasks.map((task) => (
            <div key={task.id} className="flex min-h-14 items-center justify-between border-b border-primary">
              <span className={task.completed ? "text-muted line-through" : "text-primary"}>{task.label}</span>
              <span className={`label-caps ${task.completed ? "text-success" : "text-muted"}`}>{task.completed ? "Done" : "N/A"}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="hard-card p-5">
        <h2 className="label-caps mb-3 text-muted">Journal</h2>
        <p className="leading-7">{record.journal?.text || "No journal entry for this day."}</p>
      </section>
    </>
  );
}

function UnsavedChangesModal({ saving, onDiscard, onSave }: { saving: boolean; onDiscard: () => void; onSave: () => void }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[100] px-5 pt-3" role="dialog" aria-label="Unsaved day changes">
      <div className="mx-auto flex max-w-lg items-center gap-3 border-2 border-orange bg-background p-4 shadow-hard-orange">
        <AlertTriangle className="shrink-0 text-orange" size={20} />
        <div className="min-w-0 flex-1">
          <p className="label-caps text-primary">Unsaved changes</p>
          <p className="text-xs text-muted">Save to overwrite this day, or discard.</p>
        </div>
        <button className="label-caps text-muted" type="button" onClick={onDiscard}>Discard</button>
        <button className="bg-orange px-3 py-2 label-caps text-background disabled:opacity-60" type="button" disabled={saving} onClick={onSave}>{saving ? "Saving" : "Save"}</button>
      </div>
    </div>
  );
}

function PhotoPicker({ capture, icon, label, onPhotoSelect }: { capture?: boolean; icon: React.ReactNode; label: string; onPhotoSelect: (file?: File) => void }) {
  return (
    <label className="focus-ring flex min-h-12 cursor-pointer items-center justify-center gap-2 border-2 border-primary px-3 label-caps text-primary">
      {icon}
      {label}
      <input accept="image/*" capture={capture ? "environment" : undefined} className="sr-only" type="file" onChange={(event) => onPhotoSelect(event.currentTarget.files?.[0])} />
    </label>
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

function updateTask(taskId: string, completed: boolean, setTasks: Dispatch<SetStateAction<TaskCompletion[]>>) {
  setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, completed } : task)));
}

async function selectPhoto(
  file: File | undefined,
  dayId: string,
  setPendingPhotoDraft: Dispatch<SetStateAction<boolean>>,
  setPendingPhotoUrl: Dispatch<SetStateAction<string | undefined>>,
  setTasks: Dispatch<SetStateAction<TaskCompletion[]>>
) {
  if (!file) return;
  const draft = await saveDraftPhoto(dayId, file);
  setPendingPhotoDraft(true);
  const previewUrl = await previewImageUrl(draft.imageBlob);
  setPendingPhotoUrl((current) => {
    if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
    return previewUrl;
  });
  setTasks((current) => current.map((task) => (task.taskKey === "progressPhoto" ? { ...task, completed: true } : task)));
}

function toneClass(tone: "green" | "orange" | "blue") {
  return tone === "orange" ? "bg-orange text-background" : tone === "blue" ? "bg-blue text-primary" : "bg-success text-background";
}

function cleanJournal(input: ReturnType<typeof getJournalForm>): Omit<JournalEntry, "id" | "challengeDayId" | "createdAt" | "updatedAt"> {
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
  return { ...input, text: input.text.trim(), weight: input.weight.trim() };
}

function saveButtonClass(saveState: "idle" | "saving" | "saved", hasUnsavedChanges: boolean) {
  if (saveState === "saving") return "border-orange bg-orange text-background";
  if (saveState === "saved") return "border-success bg-success text-background";
  if (!hasUnsavedChanges) return "border-outline text-muted opacity-60";
  return "border-primary text-primary active:bg-primary active:text-background";
}

function sameTasks(left: TaskCompletion[], right: TaskCompletion[]) {
  return left.every((task) => task.completed === right.find((savedTask) => savedTask.taskKey === task.taskKey)?.completed);
}
