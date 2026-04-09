import { getAll, getOne, run } from "../../core/db/db";
import { Difficulty } from "../gamification/difficulty";

// Single habit entity stored in DB

export type Habit = {
  id?: number;
  title: string;
  description?: string;
  motivation_reason: string;

  floor_goal?: string;
  target_goal?: string;
  ceiling_goal?: string;

  color: string;
  difficulty: Difficulty;
  is_active: boolean;
};


// Single day status for habit

export type HabitDay = {
  id?: number;
  habit_id: number;
  date: string; // YYYY-MM-DD
  status: number; // 0 empty, 1 skipped, 2 completed
  xp_awarded?: boolean;
};


 // Map DB row → frontend model
const mapHabit = (r: any): Habit => ({
  id: r.id,
  title: r.title,
  description: r.description,
  motivation_reason: r.motivation_reason,
  floor_goal: r.floor_goal,
  target_goal: r.target_goal,
  ceiling_goal: r.ceiling_goal,
  color: r.color,
  difficulty: r.difficulty,
  is_active: !!r.is_active,
});

/**
 * Repository layer for habits
 * Handles only DB operations (no logic)
 */
export const habitRepo = {

  // Get all active habits

  getAll: (): Habit[] => {
    const rows = getAll(`
      SELECT * FROM habits
      WHERE is_active = 1
      ORDER BY created_at DESC
    `);

    return rows.map(mapHabit);
  },

  getById: (id: number): Habit | null => {
    const row = getOne(
      `SELECT * FROM habits WHERE id = ?`,
      [id]
    );

    return row ? mapHabit(row) : null;
  },

  upsert: (data: Habit) => {
    run(
      `
      INSERT INTO habits (
        id,
        title, description, motivation_reason,
        floor_goal, target_goal, ceiling_goal,
        color, difficulty, is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        motivation_reason = excluded.motivation_reason,
        floor_goal = excluded.floor_goal,
        target_goal = excluded.target_goal,
        ceiling_goal = excluded.ceiling_goal,
        color = excluded.color,
        difficulty = excluded.difficulty
      `,
      [
        data.id ?? null,
        data.title,
        data.description || "",
        data.motivation_reason,
        data.floor_goal || "",
        data.target_goal || "",
        data.ceiling_goal || "",
        data.color,
        data.difficulty,
      ]
    );
},

  // Soft delete (keeps history)

  delete: (id: number) => {
    run(`UPDATE habits SET is_active = 0 WHERE id = ?`, [id]);
  },

  // Get days for given habit in date range

  getDays: (habitId: number, from: string, to: string): HabitDay[] => {
    return getAll(
      `
      SELECT * FROM habit_days
      WHERE habit_id = ?
      AND date BETWEEN ? AND ?
      `,
      [habitId, from, to]
    );
  },

  // Get single day (or null)

  getDay: (habitId: number, date: string): HabitDay | null => {
    return getOne(
      `
      SELECT * FROM habit_days
      WHERE habit_id = ? AND date = ?
      `,
      [habitId, date]
    );
  },

  // Upsert day status

  upsertDay: (data: HabitDay) => {
    run(
      `
      INSERT INTO habit_days (habit_id, date, status, xp_awarded)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(habit_id, date) DO UPDATE SET
        status = excluded.status
      `,
      [
        data.habit_id,
        data.date,
        data.status,
        data.xp_awarded ? 1 : 0,
      ]
    );
  },
};