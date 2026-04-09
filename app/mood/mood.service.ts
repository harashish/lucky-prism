// calculates both:
// - current streak (from today backwards)
// - longest streak (historical max)
export const calculateStreak = (entries: { date: string }[]) => {
  if (!entries.length) {
    return { current: 0, longest: 0 };
  }

  // normalize + sort ascending
  const dates = entries.map(e => e.date).sort();

  let longest = 0;
  let temp = 0;
  let last: string | null = null;

  // longest streak
  for (const d of dates) {
    if (last) {
      const diff =
        (new Date(d).getTime() - new Date(last).getTime()) /
        (1000 * 60 * 60 * 24);

      temp = diff === 1 ? temp + 1 : 1;
    } else {
      temp = 1;
    }

    longest = Math.max(longest, temp);
    last = d;
  }

  // current streak (must include today)
  let current = 0;
  const set = new Set(dates);

  let check = new Date();

  while (true) {
    const d = check.toISOString().slice(0, 10);

    if (!set.has(d)) break;

    current++;
    check.setDate(check.getDate() - 1);
  }

  return { current, longest };
};