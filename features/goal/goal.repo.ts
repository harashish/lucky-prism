import { getAll, getOne, run } from "../../core/db/db";
import { Difficulty } from "../gamification/difficulty";
import { Period } from "./goal.types";

export interface GoalStep {
  id?: number;
  goal_id: number;
  title: string;
  is_completed: number;
  order: number;
  created_at: string;
}

export interface Goal {
  id?: number;

  title: string;
  description: string;
  motivation_reason: string;

  floor_goal?: string;
  target_goal?: string;
  ceiling_goal?: string;

  period: Period;
  difficulty: Difficulty;

  is_completed: number;
  completed_at?: string | null;

  is_archived: number;
  archived_at?: string | null;

  created_at: string;
  updated_at: string;
}

export const goalRepo = {
  getAll(period?: Period, archived = false): Goal[] {
    let query = `
      SELECT * FROM goals
      WHERE is_archived = ?
    `;

    const params: any[] = [archived ? 1 : 0];

    if (period) {
      query += ` AND period = ?`;
      params.push(period);
    }

    query += ` ORDER BY created_at DESC`;

    return getAll(query, params);
  },

  getSteps(goalId: number): GoalStep[] {
    return getAll<GoalStep>(
      `SELECT * FROM goal_steps WHERE goal_id = ? ORDER BY "order" ASC`,
      [goalId]
    );
  },

  getById: (id: number): Goal | null => {
    const row = getOne(
      `SELECT * FROM goals WHERE id = ?`,
      [id]
    );

    return row ?? null;
  },

  insert(goal: Goal): number {
    const now = new Date().toISOString();

    const result = run(
      `
      INSERT INTO goals (
        title, description, motivation_reason,
        floor_goal, target_goal, ceiling_goal,
        period, difficulty,
        is_completed, is_archived,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
      `,
      [
        goal.title,
        goal.description,
        goal.motivation_reason,
        goal.floor_goal ?? "",
        goal.target_goal ?? "",
        goal.ceiling_goal ?? "",
        goal.period,
        goal.difficulty,
        now,
        now,
      ]
    );

    return result.lastInsertRowId as number;
  },

  update(id: number, data: Partial<Goal>) {
    const fields = Object.keys(data)
      .map((k) => `${k} = ?`)
      .join(", ");

    run(
      `UPDATE goals SET ${fields}, updated_at = ? WHERE id = ?`,
      [...Object.values(data), new Date().toISOString(), id]
    );
  },

  delete(id: number) {
    run(`DELETE FROM goals WHERE id = ?`, [id]);
    run(`DELETE FROM goal_steps WHERE goal_id = ?`, [id]);
  },

  complete(id: number) {
    run(
      `UPDATE goals SET is_completed = 1, completed_at = ? WHERE id = ?`,
      [new Date().toISOString(), id]
    );
  },

  toggleArchive(id: number, isArchived: number) {
    run(
      `
      UPDATE goals
      SET is_archived = ?, 
          archived_at = ?, 
          created_at = CASE WHEN ? = 0 THEN ? ELSE created_at END
      WHERE id = ?
      `,
      [
        isArchived,
        isArchived ? new Date().toISOString() : null,
        isArchived,
        new Date().toISOString(),
        id,
      ]
    );
  },

  // ===== STEPS =====

  addStep(goalId: number, title: string) {
    const max = getOne<{ max: number }>(
      `SELECT MAX("order") as max FROM goal_steps WHERE goal_id = ?`,
      [goalId]
    );

    const order = (max?.max ?? -1) + 1;

    run(
      `
      INSERT INTO goal_steps (goal_id, title, is_completed, "order", created_at)
      VALUES (?, ?, 0, ?, ?)
      `,
      [goalId, title, order, new Date().toISOString()]
    );
  },

  toggleStep(stepId: number) {
    run(
      `
      UPDATE goal_steps
      SET is_completed = CASE WHEN is_completed = 1 THEN 0 ELSE 1 END
      WHERE id = ?
      `,
      [stepId]
    );
  },

  updateStep(stepId: number, title: string) {
    run(
      `UPDATE goal_steps SET title = ? WHERE id = ?`,
      [title, stepId]
    );
  },

  deleteStep(stepId: number) {
    run(`DELETE FROM goal_steps WHERE id = ?`, [stepId]);
  },
};