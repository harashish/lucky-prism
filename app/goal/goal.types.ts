export const PERIODS = {
  weekly: {
    key: "weekly",
  },
  monthly: {
    key: "monthly",
  },
  yearly: {
    key: "yearly",
  },
} as const;

export type Period = keyof typeof PERIODS;