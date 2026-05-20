import Dexie, { type Table } from "dexie";
import type { AppSettings, Challenge, ChallengeAttempt, ChallengeDay, DraftPhoto, JournalEntry, ProgressPhoto, TaskCompletion } from "../domain/types";

export class ImHardDb extends Dexie {
  settings!: Table<AppSettings, string>;
  challenges!: Table<Challenge, string>;
  days!: Table<ChallengeDay, string>;
  tasks!: Table<TaskCompletion, string>;
  photos!: Table<ProgressPhoto, string>;
  draftPhotos!: Table<DraftPhoto, string>;
  journals!: Table<JournalEntry, string>;
  attempts!: Table<ChallengeAttempt, string>;

  constructor() {
    super("im-hard-local-db");
    this.version(1).stores({
      settings: "id",
      challenges: "id, status, startDate",
      days: "id, challengeId, dayNumber, date, status",
      tasks: "id, challengeDayId, taskKey, completed",
      photos: "id, challengeDayId",
      journals: "id, challengeDayId",
      attempts: "id, challengeId, attemptNumber, status"
    });
    this.version(2).stores({
      draftPhotos: "id, challengeDayId"
    });
  }
}

export const db = new ImHardDb();
