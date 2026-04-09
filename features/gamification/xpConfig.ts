import { Period } from "../../features/goal/goal.types";

// MULTIPLIERS
export const MODULE_MULTIPLIER = {
  habit: 1,
  mood: 0.5,
  goal: 1.5,
  challenge: 2,
} as const;

export type Module = keyof typeof MODULE_MULTIPLIER;


// GOAL - PERIOD MULTIPLIER
export const GOAL_PERIOD_MULTIPLIER: Record<Period, number> = {
  weekly: 1,
  monthly: 3,
  yearly: 8,
};


/*
// CHALLENGE - PERIOD MULTIPLIER (for future use if we want to add time-based challenges)
export const CHALLENGE_PERIOD_MULTIPLIER = {
  daily: 1,
  weekly: 2,
  monthly: 4,
} as const;

export type ChallengePeriod = keyof typeof CHALLENGE_PERIOD_MULTIPLIER;

*/