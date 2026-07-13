import { db } from "../../core/db/db";
import { Difficulty } from "../gamification/difficulty";

// ===== TYPES =====

export type TodoCategory = {
  id?: number;
  name: string;
  difficulty: Difficulty;
  color?: string | null;
  is_default?: number;
};

export type TodoTask = {
  id?: number;
  content: string;

  custom_difficulty?: Difficulty | null;

  category_id: number;

  is_completed: number; // 0 / 1
  completed_at?: string | null;

  order: number;

  created_at: string;
  updated_at: string;
};

// ===== INIT =====

export const todoRepo = {
  init() {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS todo_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        color TEXT
      );

      CREATE TABLE IF NOT EXISTS todo_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,

        custom_difficulty TEXT,

        category_id INTEGER NOT NULL,

        is_completed INTEGER DEFAULT 0,
        completed_at TEXT,

        "order" INTEGER DEFAULT 0,

        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  },

  // ===== CATEGORY =====

  getCategories(): TodoCategory[] {
    return db.getAllSync(`SELECT * FROM todo_categories ORDER BY name`);
  },

  getCategoryById(id: number): TodoCategory | null {
    return db.getFirstSync(
      `SELECT * FROM todo_categories WHERE id = ?`,
      [id]
    );
  },

  createCategory(data: TodoCategory, isDefault = 0): number {
    const result = db.runSync(
      `INSERT INTO todo_categories (name, difficulty, color, is_default)
       VALUES (?, ?, ?, ?)`,
      [data.name, data.difficulty, data.color ?? null, isDefault]
    );

    return result.lastInsertRowId as number;
  },

  updateCategory(id: number, data: TodoCategory) {
    db.runSync(
      `UPDATE todo_categories
       SET name = ?, difficulty = ?, color = ?
       WHERE id = ?`,
      [data.name, data.difficulty, data.color ?? null, id]
    );
  },

deleteCategory(id: number) {
  const category = this.getCategoryById(id);

  if (category?.is_default) {
    return { ok: false, reason: "default_category" };
  }

  const count = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM todo_categories`
  )?.count;

  if (count && count <= 1) {
    return { ok: false, reason: "last_category" };
  }

  db.runSync(`DELETE FROM todo_tasks WHERE category_id = ?`, [id]);
  db.runSync(`DELETE FROM todo_categories WHERE id = ?`, [id]);

  return { ok: true };
},

  // ===== TASKS =====

  getTasks(categoryId?: number): TodoTask[] {
    if (categoryId) {
      return db.getAllSync(
        `SELECT * FROM todo_tasks
         WHERE category_id = ?
         ORDER BY "order"`,
        [categoryId]
      );
    }

    return db.getAllSync(
      `SELECT * FROM todo_tasks ORDER BY "order"`
    );
  },

  getTaskById(id: number): TodoTask | null {
    return db.getFirstSync(
      `SELECT * FROM todo_tasks WHERE id = ?`,
      [id]
    );
  },

    createTask(
      data: Omit<
        TodoTask,
        "id" | "order" | "created_at" | "updated_at" | "is_completed" | "completed_at"
      >
    ): number {
    // Przesuwamy istniejące zadania, aby nowe zawsze trafiało na początek listy.
    db.runSync(
      `UPDATE todo_tasks
       SET "order" = "order" + 1
       WHERE category_id = ?`,
      [data.category_id]
    );

    const nextOrder = 0;

    const now = new Date().toISOString();

    const result = db.runSync(
      `INSERT INTO todo_tasks (
        content,
        custom_difficulty,
        category_id,
        is_completed,
        completed_at,
        "order",
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.content,
        data.custom_difficulty ?? null,
        data.category_id,
        0,              // is_completed
        null,           // completed_at
        nextOrder,      // order
        now,            // created_at
        now,            // updated_at
      ]
    );

    return result.lastInsertRowId as number;
  },

  updateTask(id: number, data: Partial<TodoTask>) {
    const existing = this.getTaskById(id);
    if (!existing) return;

    const updated = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
    };

    db.runSync(
      `UPDATE todo_tasks SET
        content = ?,
        custom_difficulty = ?,
        category_id = ?,
        is_completed = ?,
        completed_at = ?,
        "order" = ?,
        updated_at = ?
       WHERE id = ?`,
      [
        updated.content,
        updated.custom_difficulty ?? null,
        updated.category_id,
        updated.is_completed,
        updated.completed_at ?? null,
        updated.order,
        updated.updated_at,
        id,
      ]
    );
  },

  deleteTask(id: number) {
    db.runSync(`DELETE FROM todo_tasks WHERE id = ?`, [id]);
  },

  // ===== COMPLETE =====

  completeTask(id: number) {
    const task = this.getTaskById(id);
    if (!task) return { ok: false };

    if (task.is_completed) {
      return { ok: true, alreadyCompleted: true };
    }

    const now = new Date().toISOString();

    this.updateTask(id, {
      is_completed: 1,
      completed_at: now,
    });

    return {
      ok: true,
      taskId: id,
    };
  },


  uncompleteTask(id: number) {
    this.updateTask(id, {
      is_completed: 0,
      completed_at: null,
    });

    return { ok: true };
},

  // ===== RANDOM =====

  getRandomTask(categoryId?: number): TodoTask | null {
    let tasks: TodoTask[];

    if (categoryId) {
      tasks = db.getAllSync(
        `SELECT * FROM todo_tasks
         WHERE category_id = ? AND is_completed = 0`,
        [categoryId]
      );
    } else {
      tasks = db.getAllSync(
        `SELECT * FROM todo_tasks WHERE is_completed = 0`
      );
    }

    if (tasks.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * tasks.length);
    return tasks[randomIndex];
  },

  // ===== HAS UNCOMPLETED =====

  hasUncompleted(categoryId: number): boolean {
    const result = db.getFirstSync<{ exists: number }>(
      `SELECT EXISTS(
        SELECT 1 FROM todo_tasks
        WHERE category_id = ? AND is_completed = 0
      ) as exists`,
      [categoryId]
    );

    return !!result?.exists;
  },

  // ===== REORDER =====

  reorder(categoryId: number, items: { id: number; order: number }[]) {
    items.forEach((item) => {
      db.runSync(
        `UPDATE todo_tasks
         SET "order" = ?
         WHERE id = ? AND category_id = ?`,
        [item.order, item.id, categoryId]
      );
    });
  },
};
