import { CHALLENGE_LENGTH } from "./constants";
import { currentDayNumber } from "./dates";
import type { Challenge, ChallengeDay, DayRecord, JournalEntry, ProgressPhoto } from "./types";

export function completedTaskCount(record: DayRecord): number {
  return record.tasks.filter((task) => task.completed).length;
}

export function canCompleteDay(record: DayRecord): boolean {
  return record.tasks.every((task) => task.completed);
}

export function getDayStatus(day: ChallengeDay, challenge: Challenge): ChallengeDay["status"] {
  if (day.status === "complete") return "complete";
  const todayNumber = currentDayNumber(challenge.startDate);
  if (day.dayNumber < todayNumber) return "missed";
  if (day.dayNumber === todayNumber) return day.status === "not_started" ? "in_progress" : day.status;
  return "not_started";
}

export function statsFor(challenge: Challenge, days: ChallengeDay[], journals: JournalEntry[], photos: ProgressPhoto[]) {
  const completed = days.filter((day) => day.status === "complete").length;
  const missed = days.filter((day) => getDayStatus(day, challenge) === "missed").length;
  const currentDay = currentDayNumber(challenge.startDate);
  const finishedAt = new Date(`${challenge.endDate}T00:00:00`);
  const ratedMood = journals.map((entry) => entry.moodRating).filter((value): value is number => typeof value === "number");
  const ratedDifficulty = journals.map((entry) => entry.difficultyRating).filter((value): value is number => typeof value === "number");

  return {
    currentDay,
    completed,
    missed,
    remaining: CHALLENGE_LENGTH - completed,
    currentStreak: countCurrentStreak(days, currentDay),
    longestStreak: countLongestStreak(days),
    photos: photos.length,
    journals: journals.filter((entry) => entry.text.trim()).length,
    averageMood: average(ratedMood),
    averageDifficulty: average(ratedDifficulty),
    finishDate: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(finishedAt)
  };
}

function countCurrentStreak(days: ChallengeDay[], currentDay: number): number {
  let streak = 0;
  for (let i = Math.min(currentDay, days.length); i >= 1; i -= 1) {
    const day = days[i - 1];
    if (!day || day.status !== "complete") break;
    streak += 1;
  }
  return streak;
}

function countLongestStreak(days: ChallengeDay[]): number {
  let longest = 0;
  let current = 0;
  days.forEach((day) => {
    if (day.status === "complete") {
      current += 1;
      longest = Math.max(longest, current);
      return;
    }
    current = 0;
  });
  return longest;
}

function average(values: number[]): number | undefined {
  if (!values.length) return undefined;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}
