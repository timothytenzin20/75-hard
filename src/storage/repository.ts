import { CHALLENGE_LENGTH, createTaskCompletions } from "../domain/constants";
import { addDays, currentDayNumber, toDateKey } from "../domain/dates";
import { DEFAULT_THEME_ID } from "../domain/themes";
import type { ActiveChallengeState, AppSettings, Challenge, ChallengeAttempt, ChallengeDay, DayRecord, JournalEntry, ProgressPhoto, TaskCompletion, TaskKey, ThemeId } from "../domain/types";
import { db } from "./db";
import { compressImage } from "./images";

const now = () => new Date().toISOString();

function id(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export async function getSettings(): Promise<AppSettings> {
  const existing = await db.settings.get("settings");
  if (existing) {
    const normalized = { ...existing, theme: existing.theme ?? DEFAULT_THEME_ID };
    if (!existing.theme) {
      await db.settings.put({ ...normalized, updatedAt: now() });
    }
    return normalized;
  }
  const timestamp = now();
  const settings: AppSettings = {
    id: "settings",
    onboardingComplete: false,
    localStorageWarningAccepted: false,
    theme: DEFAULT_THEME_ID,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  await db.settings.put(settings);
  return settings;
}

export async function acceptStorageWarning(): Promise<void> {
  const settings = await getSettings();
  await db.settings.put({ ...settings, localStorageWarningAccepted: true, onboardingComplete: true, updatedAt: now() });
}

export async function updateTheme(theme: ThemeId): Promise<void> {
  const settings = await getSettings();
  await db.settings.put({ ...settings, theme, updatedAt: now() });
}

export async function getActiveChallenge(): Promise<ActiveChallengeState | undefined> {
  const challenge = await db.challenges.where("status").equals("active").first();
  if (!challenge) return undefined;
  await ensureDaysForChallenge(challenge);
  await markPastIncompleteDays(challenge);
  const days = await db.days.where("challengeId").equals(challenge.id).sortBy("dayNumber");
  const todayDay = days[currentDayNumber(challenge.startDate) - 1] ?? days[0];
  const today = await getDayRecord(todayDay.id);
  return { challenge, days, today };
}

export async function startChallenge(): Promise<Challenge> {
  const active = await db.challenges.where("status").equals("active").first();
  if (active) return active;
  const startDate = toDateKey(new Date());
  const timestamp = now();
  const challenge: Challenge = {
    id: id("challenge"),
    title: "im hard",
    type: "75-hard",
    startDate,
    endDate: addDays(startDate, CHALLENGE_LENGTH - 1),
    status: "active",
    strictMode: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  await db.challenges.add(challenge);
  await ensureDaysForChallenge(challenge);
  return challenge;
}

export async function restartChallenge(failedDayNumber?: number): Promise<Challenge> {
  const active = await db.challenges.where("status").equals("active").first();
  if (active) {
    const timestamp = now();
    await db.transaction("rw", db.challenges, db.attempts, async () => {
      await db.challenges.update(active.id, { status: "archived", updatedAt: timestamp });
      await db.attempts.add({
        id: id("attempt"),
        challengeId: active.id,
        attemptNumber: (await db.attempts.count()) + 1,
        startDate: active.startDate,
        endDate: toDateKey(new Date()),
        status: "archived",
        failedDayNumber,
        createdAt: timestamp
      });
    });
  }
  return startChallenge();
}

export async function getDayRecord(dayId: string): Promise<DayRecord> {
  const day = await db.days.get(dayId);
  if (!day) throw new Error("Day not found");
  const [tasks, photo, journal] = await Promise.all([
    db.tasks.where("challengeDayId").equals(dayId).sortBy("taskKey"),
    db.photos.where("challengeDayId").equals(dayId).first(),
    db.journals.where("challengeDayId").equals(dayId).first()
  ]);
  const orderedTasks = createTaskCompletions(dayId).map((template) => tasks.find((task) => task.taskKey === template.taskKey) ?? template);
  return { day, tasks: orderedTasks, photo, journal };
}

export async function getAllRecords(challengeId: string): Promise<DayRecord[]> {
  const days = await db.days.where("challengeId").equals(challengeId).sortBy("dayNumber");
  return Promise.all(days.map((day) => getDayRecord(day.id)));
}

export async function setTask(dayId: string, taskKey: TaskKey, completed: boolean, options: { preserveDayStatus?: boolean } = {}): Promise<void> {
  const task = await db.tasks.where({ challengeDayId: dayId, taskKey }).first();
  const timestamp = now();
  if (!task) return;
  const dayUpdate = options.preserveDayStatus ? { updatedAt: timestamp } : { status: "in_progress" as const, updatedAt: timestamp };
  await db.transaction("rw", db.tasks, db.days, async () => {
    await db.tasks.update(task.id, { completed, completedAt: completed ? timestamp : undefined });
    await db.days.update(dayId, dayUpdate);
  });
}

export async function savePhoto(dayId: string, file: File, options: { preserveDayStatus?: boolean } = {}): Promise<void> {
  const [imageBlob, thumbnailBlob] = await Promise.all([compressImage(file), compressImage(file, true)]);
  const timestamp = now();
  const existing = await db.photos.where("challengeDayId").equals(dayId).first();
  const task = await db.tasks.where({ challengeDayId: dayId, taskKey: "progressPhoto" }).first();
  const photo: ProgressPhoto = {
    id: existing?.id ?? id("photo"),
    challengeDayId: dayId,
    imageBlob,
    thumbnailBlob,
    mimeType: "image/jpeg",
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp
  };
  const dayUpdate = options.preserveDayStatus ? { updatedAt: timestamp } : { status: "in_progress" as const, updatedAt: timestamp };
  await db.transaction("rw", db.photos, db.tasks, db.days, async () => {
    await db.photos.put(photo);
    if (task) {
      await db.tasks.update(task.id, { completed: true, completedAt: timestamp });
    }
    await db.days.update(dayId, dayUpdate);
  });
}

export async function saveJournal(dayId: string, input: Omit<JournalEntry, "id" | "challengeDayId" | "createdAt" | "updatedAt">, options: { preserveDayStatus?: boolean } = {}): Promise<void> {
  const timestamp = now();
  const existing = await db.journals.where("challengeDayId").equals(dayId).first();
  await db.journals.put({
    ...input,
    id: existing?.id ?? id("journal"),
    challengeDayId: dayId,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp
  });
  await db.days.update(dayId, options.preserveDayStatus ? { updatedAt: timestamp } : { status: "in_progress", updatedAt: timestamp });
}

export async function completeDay(dayId: string): Promise<void> {
  const timestamp = now();
  await db.days.update(dayId, { status: "complete", completedAt: timestamp, updatedAt: timestamp });
}

export async function setDayCompletionFromRequirements(dayId: string, requirementsMet: boolean): Promise<void> {
  const day = await db.days.get(dayId);
  if (!day) return;
  const timestamp = now();
  if (requirementsMet && day.status !== "complete") {
    await db.days.update(dayId, { status: "complete", completedAt: day.completedAt ?? timestamp, updatedAt: timestamp });
    return;
  }
  if (!requirementsMet && day.status === "complete") {
    await db.days.update(dayId, { status: "in_progress", completedAt: undefined, updatedAt: timestamp });
  }
}

export async function getStatsInputs(challengeId: string) {
  const [days, journals, photos] = await Promise.all([
    db.days.where("challengeId").equals(challengeId).sortBy("dayNumber"),
    db.journals.toArray(),
    db.photos.toArray()
  ]);
  const dayIds = new Set(days.map((day) => day.id));
  return {
    days,
    journals: journals.filter((journal) => dayIds.has(journal.challengeDayId)),
    photos: photos.filter((photo) => dayIds.has(photo.challengeDayId))
  };
}

interface ExportedPhoto extends Omit<ProgressPhoto, "imageBlob" | "thumbnailBlob"> {
  imageDataUrl: string;
  thumbnailDataUrl?: string;
}

interface ImHardBackup {
  app: "im-hard";
  version: 1;
  exportedAt: string;
  data: {
    settings: AppSettings[];
    challenges: Challenge[];
    days: ChallengeDay[];
    tasks: TaskCompletion[];
    photos: ExportedPhoto[];
    journals: JournalEntry[];
    attempts: ChallengeAttempt[];
  };
}

export async function exportBackup(): Promise<Blob> {
  const [settings, challenges, days, tasks, photos, journals, attempts] = await Promise.all([
    db.settings.toArray(),
    db.challenges.toArray(),
    db.days.toArray(),
    db.tasks.toArray(),
    db.photos.toArray(),
    db.journals.toArray(),
    db.attempts.toArray()
  ]);
  const backup: ImHardBackup = {
    app: "im-hard",
    version: 1,
    exportedAt: now(),
    data: {
      settings,
      challenges,
      days,
      tasks,
      photos: await Promise.all(
        photos.map(async (photo) => ({
          id: photo.id,
          challengeDayId: photo.challengeDayId,
          mimeType: photo.mimeType,
          createdAt: photo.createdAt,
          updatedAt: photo.updatedAt,
          imageDataUrl: await blobToDataUrl(photo.imageBlob),
          thumbnailDataUrl: photo.thumbnailBlob ? await blobToDataUrl(photo.thumbnailBlob) : undefined
        }))
      ),
      journals,
      attempts
    }
  };
  return new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
}

export async function importBackup(file: File): Promise<void> {
  const backup = JSON.parse(await file.text()) as ImHardBackup;
  if (backup.app !== "im-hard" || backup.version !== 1) {
    throw new Error("This is not a supported im hard backup file.");
  }
  const photos: ProgressPhoto[] = await Promise.all(
    backup.data.photos.map(async (photo) => ({
      id: photo.id,
      challengeDayId: photo.challengeDayId,
      mimeType: photo.mimeType,
      createdAt: photo.createdAt,
      updatedAt: photo.updatedAt,
      imageBlob: dataUrlToBlob(photo.imageDataUrl),
      thumbnailBlob: photo.thumbnailDataUrl ? dataUrlToBlob(photo.thumbnailDataUrl) : undefined
    }))
  );
  await db.transaction("rw", [db.settings, db.challenges, db.days, db.tasks, db.photos, db.journals, db.attempts], async () => {
    await Promise.all([db.settings.clear(), db.challenges.clear(), db.days.clear(), db.tasks.clear(), db.photos.clear(), db.journals.clear(), db.attempts.clear()]);
    await db.settings.bulkPut(backup.data.settings);
    await db.challenges.bulkPut(backup.data.challenges);
    await db.days.bulkPut(backup.data.days);
    await db.tasks.bulkPut(backup.data.tasks);
    await db.photos.bulkPut(photos);
    await db.journals.bulkPut(backup.data.journals);
    await db.attempts.bulkPut(backup.data.attempts);
  });
}

async function ensureDaysForChallenge(challenge: Challenge): Promise<void> {
  const existing = await db.days.where("challengeId").equals(challenge.id).count();
  if (existing >= CHALLENGE_LENGTH) return;
  const timestamp = now();
  const days: ChallengeDay[] = Array.from({ length: CHALLENGE_LENGTH }, (_, index) => ({
    id: `${challenge.id}:day-${index + 1}`,
    challengeId: challenge.id,
    dayNumber: index + 1,
    date: addDays(challenge.startDate, index),
    status: index === currentDayNumber(challenge.startDate) - 1 ? "in_progress" : "not_started",
    createdAt: timestamp,
    updatedAt: timestamp
  }));
  await db.transaction("rw", db.days, db.tasks, async () => {
    await db.days.bulkPut(days);
    await db.tasks.bulkPut(days.flatMap((day) => createTaskCompletions(day.id)));
  });
}

async function markPastIncompleteDays(challenge: Challenge): Promise<void> {
  const today = currentDayNumber(challenge.startDate);
  const past = await db.days.where("challengeId").equals(challenge.id).and((day) => day.dayNumber < today && day.status !== "complete" && day.status !== "missed").toArray();
  if (!past.length) return;
  const timestamp = now();
  await db.days.bulkPut(past.map((day) => ({ ...day, status: "missed", updatedAt: timestamp })));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mimeType = header.match(/data:(.*);base64/)?.[1] ?? "application/octet-stream";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}
