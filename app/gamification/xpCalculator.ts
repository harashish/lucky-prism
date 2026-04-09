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

  if (module === "habit") {
    const streakBonus = Math.min(streak, 7) * 0.15;
    xp *= 1 + streakBonus;

    if (streak >= 7) {
      xp += 10;
    }
  }


  if (module === "goal" && period) {
    xp *= GOAL_PERIOD_MULTIPLIER[period];
  }

  return Math.round(xp);
}