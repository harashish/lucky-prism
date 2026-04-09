import { habitRepo } from "./habit.repo";

/**
 * Toggle logic for habit day
 * Mirrors backend cycling:
 * empty → completed → skipped → empty
 */
export const getNextStatus = (current: number): number => {
  if (current === 0) return 2;
  if (current === 2) return 1;
  return 0;
};


// Generate full month structure (fills missing days)

export const buildMonthDays = (
  year: number,
  month: number,
  existing: { date: string; status: number }[]
) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const map = new Map(existing.map(d => [d.date, d.status]));

  const result = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    result.push({
      date,
      status: map.get(date) ?? 0,
    });
  }

  return result;
};

// Calculate streak for single habit

export const calculateHabitStreak = (days: { date: string; status: number }[]) => {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  let longest = 0;
  let current = 0;
  let temp = 0;
  let last: string | null = null;

  for (const d of sorted) {
    if (d.status !== 2) {
      temp = 0;
      last = d.date;
      continue;
    }

    if (last) {
      const diff =
        (new Date(d.date).getTime() - new Date(last).getTime()) /
        (1000 * 60 * 60 * 24);

      temp = diff === 1 ? temp + 1 : 1;
    } else {
      temp = 1;
    }

    longest = Math.max(longest, temp);
    last = d.date;
  }

  // current streak (from today backwards)
  const set = new Set(sorted.filter(d => d.status === 2).map(d => d.date));

  let check = new Date();
  while (true) {
    const d = check.toISOString().slice(0, 10);
    if (!set.has(d)) break;

    current++;
    check.setDate(check.getDate() - 1);
  }

  return { current, longest };

};

export const getHabitCompletionContext = (
  habitId: number,
  date: string
) => {
  const today = new Date().toISOString().slice(0, 10);

  const allDays = habitRepo.getDays(
    habitId,
    "2000-01-01",
    today
  );

  const { current: streak } = calculateHabitStreak(allDays);

  const habit = habitRepo.getById(habitId);

  return {
    streak,
    difficulty: habit?.difficulty ?? "easy",
  };
};