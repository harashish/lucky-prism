import { calculateXp } from "./xpCalculator";
import { useGamificationStore } from "./gamification.store";
import { GamificationEvent } from "./gamification.types";

export function awardXp(event: GamificationEvent) {
  let xp = 0;
  let source = "unknown";

  switch (event.type) {
    case "MOOD_LOGGED":
      xp = calculateXp({
        module: "mood",
        difficulty: event.difficulty,
      });
      source = "mood";
      break;

    case "HABIT_COMPLETED":
      xp = calculateXp({
        module: "habit",
        difficulty: event.difficulty,
        streak: event.streak,
      });
      source = "habit";
      break;
      
    case "GOAL_COMPLETED":
      xp = calculateXp({
        module: "goal",
        difficulty: event.difficulty,
        period: event.period,
      });
      source = "goal";
      break;

    case "CHALLENGE_COMPLETED":
      xp = calculateXp({
        module: "challenge",
        difficulty: event.difficulty,
        period: event.period,
      });
      source = "challenge";
      break; 
      
      }

  if (xp > 0) {
    useGamificationStore.getState().addXp(xp, source);
  }

  return xp;
}