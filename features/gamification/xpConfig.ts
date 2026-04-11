import { Period as GoalPeriod } from "../../features/goal/goal.types";
import { Period as ChallengePeriod } from "../../features/challenge/challenge.types";

// MODULE
export const MODULE_MULTIPLIER = {
  habit: 1,
  mood: 0.5,
  goal: 1.5,
  challenge: 2,
} as const;

export type Module = keyof typeof MODULE_MULTIPLIER;


// GOAL
export const GOAL_PERIOD_MULTIPLIER: Record<GoalPeriod, number> = {
  weekly: 1,
  monthly: 3,
  yearly: 8,
};


// CHALLENGE
export const CHALLENGE_PERIOD_MULTIPLIER: Record<ChallengePeriod, number> = {
  daily: 1,
  weekly: 3,
};