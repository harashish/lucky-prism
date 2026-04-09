const BASE_LEVEL_XP = 50;

export function calculateLevel(totalXp: number): number {
  let level = 1;
  let xp = totalXp;

  while (xp >= BASE_LEVEL_XP * level) {
    xp -= BASE_LEVEL_XP * level;
    level++;
  }

  return level;
}