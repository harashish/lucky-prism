export const DIFFICULTIES = {
  easy: { baseXp: 20 },
  medium: { baseXp: 40 },
  hard: { baseXp: 60 },
} as const;

export type Difficulty = keyof typeof DIFFICULTIES;