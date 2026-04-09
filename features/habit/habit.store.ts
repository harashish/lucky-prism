import { create } from "zustand";
import { habitRepo, Habit } from "./habit.repo";
import { buildMonthDays, getHabitCompletionContext } from "./habit.service";
import { awardXp } from "../gamification/gamification.service";

// Zustand store for habits Handles business logic + state

type HabitState = {
  habits: (Habit & { days?: any[] })[];

  loadMonth: (month?: string) => void;

  upsertHabit: (data: Habit) => void;
  deleteHabit: (id: number) => void;

  toggleDay: (habitId: number, date: string, status?: number, month?: string) => void;
};

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],

  // Load habits + month grid

  loadMonth: (month) => {
    const habits = habitRepo.getAll();

    const base = month ? new Date(month + "-01") : new Date();
    const year = base.getFullYear();
    const mon = base.getMonth();

    const first = `${year}-${String(mon + 1).padStart(2, "0")}-01`;
    const lastDate = new Date(year, mon + 1, 0);
    const last = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, "0")}-${String(lastDate.getDate()).padStart(2, "0")}`;

    const enriched = habits.map(h => {
      const days = habitRepo.getDays(h.id!, first, last);

      return {
        ...h,
        days: buildMonthDays(year, mon, days),
      };
    });

    set({ habits: enriched });
  },

    upsertHabit: (data) => {
      habitRepo.upsert(data);
      get().loadMonth();
    },


  // Soft delete habit

  deleteHabit: (id) => {
    habitRepo.delete(id);
    get().loadMonth();
  },

  // Toggle habit day status
  toggleDay: (habitId, date, status, month) => {
    const today = new Date().toISOString().slice(0, 10);
    if (date > today) return;

    const existing = habitRepo.getDay(habitId, date);

    const newStatus =
      typeof status !== "undefined"
        ? status
        : (existing?.status === 2 ? 1 : 2);

      if (newStatus === 2 && !existing?.xp_awarded) {

        habitRepo.upsertDay({
          habit_id: habitId,
          date,
          status: newStatus,
          xp_awarded: true,
        });

        const { streak, difficulty } =
          getHabitCompletionContext(habitId, date);

        awardXp({
          type: "HABIT_COMPLETED",
          difficulty,
          streak,
        });

      } else {
        habitRepo.upsertDay({
          habit_id: habitId,
          date,
          status: newStatus,
          xp_awarded: existing?.xp_awarded ?? false,
        });
      }

    get().loadMonth(month);
  },
}));