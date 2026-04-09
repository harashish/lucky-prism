import { DIFFICULTIES } from "./difficulty";
import { GOAL_PERIOD_MULTIPLIER, MODULE_MULTIPLIER } from "./xpConfig";

type Params = {
  module: "habit" | "mood" | "goal" | "challenge";
  difficulty: keyof typeof DIFFICULTIES;
  streak?: number;
  period?: keyof typeof GOAL_PERIOD_MULTIPLIER;
};

export function calculateXp(params: Params): number {
  const { module, difficulty, streak = 0, period } = params;
  
  let xp =
    DIFFICULTIES[difficulty].baseXp *
    MODULE_MULTIPLIER[module];

  if (module === "habit" || module === "mood") {
    const cappedStreak = Math.min(streak, 7);

    // (FOR HABIT) Streak bonus: 15% per day, up to 7 days (max 105%), plus an additional 10 XP at 7 days
    // For example:
    // - 1 day: 15% bonus (total 115% of base XP)
    // - 3 days: 45% bonus (total 145% of base XP)
    // - 7 days: 105% bonus + 10 XP (total 215% of base XP + 10 XP)
    // (FOR MOOD) Streak bonus: 5% per day, up to 7 days (max 35%)
    // For example:
    // - 1 day: 5% bonus (total 105% of base XP)
    // - 3 days: 15% bonus (total 115% of base XP)
    // - 7 days: 35% bonus (total 135% of base XP) 
    const multiplier =
      module === "habit"
        ? 0.15
        : 0.05; // mood dużo słabszy

    const streakBonus = cappedStreak * multiplier;

    xp *= 1 + streakBonus;

    // extra bonus tylko dla habit
    if (module === "habit" && streak >= 7) {
      xp += 10;
    }
  }

  if (module === "goal" && period) {
    xp *= GOAL_PERIOD_MULTIPLIER[period];
  }

  return Math.round(xp);
}