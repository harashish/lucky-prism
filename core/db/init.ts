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

    // CHALLENGES

    // definitions
  run(`
    CREATE TABLE IF NOT EXISTS challenge_definitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      difficulty TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);



// tags
run(`
  CREATE TABLE IF NOT EXISTS challenge_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    is_default INTEGER DEFAULT 0
  );
`);

try {
  run(`ALTER TABLE challenge_tags ADD COLUMN color TEXT`);
} catch (e) {}

// default tag
run(`
  INSERT OR IGNORE INTO challenge_tags (id, name, is_default)
  VALUES (1, 'general', 1);
`);

// 🔥 ensure color exists
run(`
  UPDATE challenge_tags
  SET color = '#888'
  WHERE id = 1 AND color IS NULL
`);

  // MANY TO MANY
  run(`
    CREATE TABLE IF NOT EXISTS challenge_definition_tags (
      definition_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (definition_id, tag_id)
    );
  `);

  // user challenges
  run(`
    CREATE TABLE IF NOT EXISTS user_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      definition_id INTEGER NOT NULL,
      challenge_type TEXT NOT NULL,

      start_date TEXT NOT NULL,
      weekly_deadline TEXT,

      is_completed INTEGER DEFAULT 0,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // logs
  run(`
    CREATE TABLE IF NOT EXISTS challenge_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id INTEGER,
      date TEXT,
      action TEXT
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