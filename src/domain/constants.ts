import type { TaskCompletion, TaskKey } from "./types";

export const CHALLENGE_LENGTH = 75;

export const TASKS: Array<{ key: TaskKey; label: string; tone: "green" | "orange" | "blue" }> = [
  { key: "diet", label: "Follow diet", tone: "green" },
  { key: "noAlcohol", label: "No alcohol", tone: "green" },
  { key: "workoutOne", label: "Workout 1 complete", tone: "orange" },
  { key: "workoutTwo", label: "Workout 2 complete", tone: "orange" },
  { key: "outdoorWorkout", label: "One workout outdoors", tone: "orange" },
  { key: "water", label: "Drink 1 gallon water", tone: "blue" },
  { key: "reading", label: "Read 10 pages", tone: "green" },
  { key: "progressPhoto", label: "Progress photo uploaded", tone: "green" }
];

export function createTaskCompletions(challengeDayId: string): TaskCompletion[] {
  return TASKS.map((task) => ({
    id: `${challengeDayId}:${task.key}`,
    challengeDayId,
    taskKey: task.key,
    label: task.label,
    completed: false
  }));
}
