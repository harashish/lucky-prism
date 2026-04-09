export const calculateGoalProgress = (goals: any[]) => {
  if (!goals.length) return 0;

  const completed = goals.filter(g => g.is_completed).length;
  return completed / goals.length;
};

import dayjs from "dayjs";

export const calculateTimeProgress = (period: string) => {
  const now = dayjs();

  if (period === "weekly") {
    return (
      now.diff(now.startOf("isoWeek")) /
      now.endOf("isoWeek").diff(now.startOf("isoWeek"))
    );
  }

  if (period === "monthly") {
    return (
      now.diff(now.startOf("month")) /
      now.endOf("month").diff(now.startOf("month"))
    );
  }

  return (
    now.diff(now.startOf("year")) /
    now.endOf("year").diff(now.startOf("year"))
  );
};

// GROUPING GOALS INTO SECTIONS (week/month/year)
// useMemo = nie licz ponownie jeśli goals i selectedPeriod się nie zmieniły
export const groupGoalsByPeriod = (goals: any[], period: string) => {
  const groups: Record<string, any[]> = {};

  goals.forEach((goal) => {
    const date = dayjs(goal.created_at);

    let label = "";

    if (period === "weekly") {
      const start = date.startOf("isoWeek").format("DD MMM");
      const end = date.endOf("isoWeek").format("DD MMM");
      label = `${start} - ${end}`;
    }

    if (period === "monthly") {
      label = date.format("MMMM YYYY");
    }

    if (period === "yearly") {
      label = date.format("YYYY");
    }

    if (!groups[label]) {
      groups[label] = [];
    }

    groups[label].push(goal);
  });

  return Object.entries(groups).map(([label, items]) => ({
    label,
    items,
  }));
};

