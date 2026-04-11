export const PRIORITIES = {
  low: {},
  normal: {},
  high: {},
} as const;

export type Priority = keyof typeof PRIORITIES;