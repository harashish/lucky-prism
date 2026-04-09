export const PERIODS = ["weekly", "monthly", "yearly"] as const;
export type Period = typeof PERIODS[number];