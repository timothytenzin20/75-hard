import { CHALLENGE_LENGTH, createTaskCompletions } from "../domain/constants";
import { addDays, currentDayNumber, toDateKey } from "../domain/dates";
import type { ActiveChallengeState, AppSettings, Challenge, ChallengeDay, DayRecord, JournalEntry, ProgressPhoto, TaskKey } from "../domain/types";
import { db } from "./db";
import { compressImage } from "./images";

const now = () => new Date().toISOString();

function id(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export async function getSettings(): Promise<AppSettings> {
  const existing = await db.settings.get("settings");
  if (existing) return existing;
  const timestamp = now();
  const settings: AppSettings = {
    id: "settings",
    onboardingComplete: false,
    localStorageWarningAccepted: false,
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

export async function setTask(dayId: string, taskKey: TaskKey, completed: boolean): Promise<void> {
  const task = await db.tasks.where({ challengeDayId: dayId, taskKey }).first();
  const timestamp = now();
  if (!task) return;
  await db.transaction("rw", db.tasks, db.days, async () => {
    await db.tasks.update(task.id, { completed, completedAt: completed ? timestamp : undefined });
    await db.days.update(dayId, { status: "in_progress", updatedAt: timestamp });
  });
}

export async function savePhoto(dayId: string, file: File): Promise<void> {
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
  await db.transaction("rw", db.photos, db.tasks, db.days, async () => {
    await db.photos.put(photo);
    if (task) {
      await db.tasks.update(task.id, { completed: true, completedAt: timestamp });
    }
    await db.days.update(dayId, { status: "in_progress", updatedAt: timestamp });
  });
}

export async function saveJournal(dayId: string, input: Omit<JournalEntry, "id" | "challengeDayId" | "createdAt" | "updatedAt">): Promise<void> {
  const timestamp = now();
  const existing = await db.journals.where("challengeDayId").equals(dayId).first();
  await db.journals.put({
    ...input,
    id: existing?.id ?? id("journal"),
    challengeDayId: dayId,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp
  });
  await db.days.update(dayId, { status: "in_progress", updatedAt: timestamp });
}

export async function completeDay(dayId: string): Promise<void> {
  const timestamp = now();
  await db.days.update(dayId, { status: "complete", completedAt: timestamp, updatedAt: timestamp });
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
