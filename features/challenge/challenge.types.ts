export const PERIODS = ["daily", "weekly"] as const;
export type Period = typeof PERIODS[number];

export const CHALLENGE_LOG_ACTIONS = [
  "assigned",
  "completed",
  "discarded",
] as const;

export type ChallengeLogAction =
  typeof CHALLENGE_LOG_ACTIONS[number];