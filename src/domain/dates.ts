import { CHALLENGE_LENGTH } from "./constants";

const dayMs = 24 * 60 * 60 * 1000;

export function toDateKey(date: Date): string {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return `${copy.getFullYear()}-${String(copy.getMonth() + 1).padStart(2, "0")}-${String(copy.getDate()).padStart(2, "0")}`;
}

export function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function daysBetween(startDateKey: string, endDateKey: string): number {
  const start = new Date(`${startDateKey}T00:00:00`).getTime();
  const end = new Date(`${endDateKey}T00:00:00`).getTime();
  return Math.floor((end - start) / dayMs);
}

export function currentDayNumber(startDate: string): number {
  return Math.min(Math.max(daysBetween(startDate, toDateKey(new Date())) + 1, 1), CHALLENGE_LENGTH);
}

export function formatShortDate(dateKey: string): string {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(`${dateKey}T00:00:00`));
}
