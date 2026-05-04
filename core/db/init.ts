import { colors } from "../../ui/theme";
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
    color TEXT,
    is_default INTEGER DEFAULT 0
  );
`);

// default tag
run(`
  INSERT OR IGNORE INTO challenge_tags (id, name, color, is_default)
  VALUES (1, 'general', '${colors.DEFAULT_TAG_COLOR}', 1);
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

  // goals


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
    priority TEXT,

    is_completed INTEGER DEFAULT 0,
    completed_at TEXT,

    is_archived INTEGER DEFAULT 0,
    archived_at TEXT,

    period_start TEXT,
    was_carried_over INTEGER DEFAULT 0,

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


  // =========================
  // TODOS
  // =========================

  // categories
  run(`
    CREATE TABLE IF NOT EXISTS todo_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      color TEXT,
      is_default INTEGER DEFAULT 0
    );
  `);


  // tasks
  run(`
    CREATE TABLE IF NOT EXISTS todo_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      content TEXT NOT NULL,

      custom_difficulty TEXT,

      category_id INTEGER NOT NULL,

      is_completed INTEGER DEFAULT 0,
      completed_at TEXT,

      "order" INTEGER DEFAULT 0,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  run(`
    INSERT OR IGNORE INTO todo_categories (id, name, difficulty, color, is_default)
    VALUES (1, 'general', 'easy', '#888', 1);
  `);


  // =========================
// SOBRIETY
// =========================

run(`
  CREATE TABLE IF NOT EXISTS sobriety (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,
    description TEXT,
    motivation_reason TEXT NOT NULL,

    started_at TEXT NOT NULL,
    ended_at TEXT,

    is_active INTEGER DEFAULT 1,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

run(`
  CREATE TABLE IF NOT EXISTS sobriety_relapse (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    sobriety INTEGER NOT NULL,
    occurred_at TEXT NOT NULL,
    note TEXT,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// =========================
// NOTES
// =========================

run(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    content TEXT NOT NULL,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// =========================
// SETTINGS
// =========================


run(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

const defaults = [
  // modules
  ["module_HabitScreen", "1"],
  ["module_MoodScreen", "1"],
  ["module_GoalScreen", "1"],
  ["module_ChallengeScreen", "1"],
  ["module_TodoScreen", "1"],
  ["module_SobrietyScreen", "1"],
  ["module_NoteScreen", "1"],
  ["module_GamificationScreen", "1"],

  // badges
  ["show_difficulty_badge", "1"],
  ["show_priority_badge", "1"],
  ["show_tag_badge", "1"],
];

defaults.forEach(([key, value]) => {
  run(
    `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
    [key, value]
  );
});


  console.log("DB INIT OK");
  } catch (e) {
    console.error("DB INIT ERROR", e);
  }
};