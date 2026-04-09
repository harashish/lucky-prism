import { Period } from "../goal/goal.types";
import { Difficulty } from "./difficulty";

export type GamificationEvent =
  | { type: "MOOD_LOGGED"; difficulty: Difficulty }
  | { type: "HABIT_COMPLETED"; difficulty: Difficulty; streak?: number }
  | { type: "GOAL_COMPLETED"; difficulty: Difficulty; period: Period }

  