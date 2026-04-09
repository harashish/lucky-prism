// core/db/init.ts


import { run } from "./db";

export const initDb = () => {
  try {

    // Gamification (single row)
    run(`
      CREATE TABLE IF NOT EXISTS gamification (
        id INTEGER PRIMARY KEY,
        total_xp INTEGER,
        current_level INTEGER,
        xp_multiplier REAL
      );
    `);

    run(`
      INSERT OR IGNORE INTO gamification (id, total_xp, current_level, xp_multiplier)
      VALUES (1, 0, 1, 1.0);
    `);

    run(`
    CREATE TABLE IF NOT EXISTS xp_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT,
      xp INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);


    // Mood entries (1 per day)
    run(`
      CREATE TABLE IF NOT EXISTS mood_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mood TEXT NOT NULL,
        emotions TEXT,
        note TEXT,
        date TEXT NOT NULL UNIQUE,
        time TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);


    // =========================
    // HABITS
    // =========================

    // Main habit entity
    run(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        motivation_reason TEXT NOT NULL,

        floor_goal TEXT,
        target_goal TEXT,
        ceiling_goal TEXT,

        color TEXT DEFAULT '#908bab',
        difficulty TEXT,
        is_active INTEGER DEFAULT 1,

        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Per-day tracking (1 row per habit per day)
    run(`
      CREATE TABLE IF NOT EXISTS habit_days (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        status INTEGER DEFAULT 0,
        xp_awarded INTEGER DEFAULT 0,

        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(habit_id, date)
      );
    `);

    run(`
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        title TEXT NOT NULL,
        description TEXT,
        motivation_reason TEXT NOT NULL,

        floor_goal TEXT,
        target_goal TEXT,
        ceiling_goal TEXT,

        period TEXT NOT NULL,
        difficulty TEXT NOT NULL,

        is_completed INTEGER DEFAULT 0,
        completed_at TEXT,

        is_archived INTEGER DEFAULT 0,
        archived_at TEXT,

        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    run(`
      CREATE TABLE IF NOT EXISTS goal_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        goal_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        "order" INTEGER DEFAULT 0,

        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("DB INIT OK");
  } catch (e) {
    console.error("DB INIT ERROR", e);
  }
};