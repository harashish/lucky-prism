import { create } from "zustand";
import { moodRepo, MoodEntry } from "./mood.repo";
import { calculateStreak } from "./mood.service";
import { awardXp } from "../gamification/gamification.service";
import { Difficulty } from "../gamification/difficulty";

type MoodState = {
  entries: MoodEntry[];
  currentYear?: number;

  streak: {
    current: number;
    longest: number;
  } | null;

  loadYear: (year: number) => void;

  addMood: (data: MoodEntry) => void;
  updateMood: (data: MoodEntry) => void;
  deleteMood: (id: number) => void;
};

export const useMoodStore = create<MoodState>((set, get) => ({
  entries: [],
  streak: null,

  // loads entries for UI (year-filtered)
  // streak is always calculated from full dataset
  loadYear: (year) => {
    const entries = moodRepo.getByYear(year);

    const allEntries = moodRepo.getAll();
    const streak = calculateStreak(allEntries);

    set({ entries, streak });
  },

  // create / update entry
  addMood: (data) => {
    const existing = moodRepo.getByDate(data.date);

    moodRepo.upsert(data);

    const entries = moodRepo.getAll();
    const streak = calculateStreak(entries);

    set({ entries, streak });

    const difficulty: Difficulty =
      data.note?.trim() ? "medium" : "easy";

    if (!existing) {
      awardXp({
        type: "MOOD_LOGGED",
        difficulty,
        streak: streak.current,
      });
    }
  },

  // alias for upsert
  updateMood: (data) => {
    get().addMood(data);
  },

  // remove entry and recalc state
  deleteMood: (id) => {
    moodRepo.delete(id);

    const { currentYear } = get();
    get().loadYear(currentYear ?? new Date().getFullYear());
  },
  
}));