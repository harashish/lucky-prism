import { DIFFICULTIES } from "./difficulty";
import { CHALLENGE_PERIOD_MULTIPLIER, GOAL_PERIOD_MULTIPLIER, MODULE_MULTIPLIER } from "./xpConfig";

type Params = {
  module: "habit" | "mood" | "goal" | "challenge" | "todo";
  difficulty: keyof typeof DIFFICULTIES;
  streak?: number;
  period?: string;
};

export function calculateXp(params: Params): number {
  const { module, difficulty, streak = 0, period } = params;
  
  let xp =
    DIFFICULTIES[difficulty].baseXp *
    MODULE_MULTIPLIER[module];

  if (module === "habit" || module === "mood") {
    const cappedStreak = Math.min(streak, 7);

    const multiplier =
      module === "habit"
        ? 0.10
        : 0.05; // mood 

    const streakBonus = cappedStreak * multiplier;

    xp *= 1 + streakBonus;

    // extra bonus tylko dla habit
    if (module === "habit" && streak >= 7) {
      xp += 10;
    }
  }

  if (module === "goal" && period) {
    xp *= GOAL_PERIOD_MULTIPLIER[period as keyof typeof GOAL_PERIOD_MULTIPLIER];
  }

  if (module === "challenge" && period) {
    xp *= CHALLENGE_PERIOD_MULTIPLIER[period as keyof typeof CHALLENGE_PERIOD_MULTIPLIER];
  }
  return Math.round(xp);
}