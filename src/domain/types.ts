export type ChallengeStatus = "active" | "completed" | "failed" | "archived";
export type DayStatus = "not_started" | "in_progress" | "complete" | "missed";
export type ThemeId = "raw-dark" | "solar-flare" | "deep-eucalyptus" | "cyber-punk" | "raw-concrete" | "dusk-violet" | "custom";

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceStrong: string;
  surfaceMuted: string;
  primary: string;
  muted: string;
  outline: string;
  accent: string;
  secondary: string;
  success: string;
  danger: string;
}

export type TaskKey =
  | "diet"
  | "noAlcohol"
  | "workoutOne"
  | "workoutTwo"
  | "outdoorWorkout"
  | "water"
  | "reading"
  | "progressPhoto";

export interface AppSettings {
  id: "settings";
  onboardingComplete: boolean;
  localStorageWarningAccepted: boolean;
  theme: ThemeId;
  customTheme?: ThemeColors;
  createdAt: string;
  updatedAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  type: "75-hard";
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
  strictMode: false;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeDay {
  id: string;
  challengeId: string;
  dayNumber: number;
  date: string;
  status: DayStatus;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCompletion {
  id: string;
  challengeDayId: string;
  taskKey: TaskKey;
  label: string;
  completed: boolean;
  completedAt?: string;
}

export interface ProgressPhoto {
  id: string;
  challengeDayId: string;
  imageDataUrl?: string;
  thumbnailDataUrl?: string;
  imageBlob?: Blob;
  thumbnailBlob?: Blob;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

export interface DraftPhoto {
  id: string;
  challengeDayId: string;
  imageDataUrl?: string;
  imageBlob?: Blob;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  challengeDayId: string;
  text: string;
  moodRating?: number;
  energyRating?: number;
  difficultyRating?: number;
  weight?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeAttempt {
  id: string;
  challengeId: string;
  attemptNumber: number;
  startDate: string;
  endDate?: string;
  status: "completed" | "failed" | "archived";
  failedDayNumber?: number;
  createdAt: string;
}

export interface DayRecord {
  day: ChallengeDay;
  tasks: TaskCompletion[];
  photo?: ProgressPhoto;
  journal?: JournalEntry;
}

export interface ActiveChallengeState {
  challenge: Challenge;
  days: ChallengeDay[];
  today: DayRecord;
}
