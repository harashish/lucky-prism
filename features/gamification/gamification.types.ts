import { Period } from "../../features/goal/goal.types";
import { Difficulty } from "./difficulty";

export type GamificationEvent =
  | { type: "MOOD_LOGGED"; difficulty: Difficulty; streak?: number }
  | { type: "HABIT_COMPLETED"; difficulty: Difficulty; streak?: number }
  | { type: "GOAL_COMPLETED"; difficulty: Difficulty; period: Period }
  | { type: "CHALLENGE_COMPLETED"; difficulty: Difficulty; period: "daily" | "weekly" }

  