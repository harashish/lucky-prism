// core/db/db.ts

import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("app.db");

/*
========================
RUN (INSERT / UPDATE / DELETE)
========================
*/
export const run = (
  query: string,
  params: any[] = []
): SQLite.SQLiteRunResult => {
  return db.runSync(query, params);
};

/*
========================
GET ALL
========================
*/
export const getAll = <T = any>(
  query: string,
  params: any[] = []
): T[] => {
  return db.getAllSync<T>(query, params);
};

/*
========================
GET ONE
========================
*/
export const getOne = <T = any>(
  query: string,
  params: any[] = []
): T | null => {
  const result = db.getFirstSync<T>(query, params);
  return result ?? null;
};

// ========================
// RESET
// ========================

export function resetDatabase() {
  const tables = [
    "habits",
    "habit_days",
    "goals",
    "goal_steps",
    "todo_tasks",
    "todo_categories",
    "mood_entries",
    "notes",
    "sobriety",
    "sobriety_relapse",
    "challenge_definitions",
    "challenge_tags",
    "challenge_definition_tags",
    "user_challenges",
    "challenge_logs",
    "xp_logs",
    "settings",
    "gamification",
  ];

  tables.forEach((table) => {
    run(`DELETE FROM ${table}`);
    try {
      run(`DELETE FROM sqlite_sequence WHERE name='${table}'`);
    } catch {}
  });
}

// ========================
// EXPORT / IMPORT
// ========================

export function exportAllTables() {
  const version = 1;

  const tables = [
    // independent
    "gamification",
    "settings",
    "challenge_tags",
    "todo_categories",

    // main entities
    "habits",
    "goals",
    "notes",
    "sobriety",
    "challenge_definitions",
    "mood_entries",

    // dependent
    "habit_days",
    "goal_steps",
    "todo_tasks",
    "sobriety_relapse",

    // challenge relations
    "challenge_definition_tags",
    "user_challenges",
    "challenge_logs",

    // logs last
    "xp_logs",
  ];

  const result: Record<string, any[]> = {};

  tables.forEach((table) => {
    result[table] = getAll(`SELECT * FROM ${table}`);
  });

  return {
    version,
    data: result,
  };
}

export function importAllTables(payload: any) {
  const version = payload?.version ?? 1;
  const data = payload?.data ?? payload;

  if (!data || typeof data !== "object") return;

  Object.entries(data).forEach(([table, rows]) => {
    if (!Array.isArray(rows)) return;

    try {
      run(`DELETE FROM ${table}`);
      run(`DELETE FROM sqlite_sequence WHERE name='${table}'`);

      rows.forEach((row) => {
        const rawKeys = Object.keys(row);
        const keys = rawKeys.map((k) => `"${k}"`);
        const placeholders = rawKeys.map(() => "?").join(",");
        const values = Object.values(row);

        run(
          `INSERT OR REPLACE INTO ${table} (${keys.join(",")}) VALUES (${placeholders})`,
          values
        );
      });
    } catch (e) {
      console.log("IMPORT ERROR TABLE:", table, e);
    }
  });

  // 🔥 TU możesz kiedyś robić migracje
  if (version === 1) {
    // future migration hook
  }
}