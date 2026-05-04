import { getAll, run, getOne } from "../../core/db/db";

export type Setting = {
  key: string;
  value: string;
};

export const settingsRepo = {
  getAll(): Setting[] {
    return getAll(`SELECT * FROM settings`);
  },

  get(key: string): string | null {
    const res = getOne<Setting>(
      `SELECT * FROM settings WHERE key = ?`,
      [key]
    );
    return res?.value ?? null;
  },

  set(key: string, value: string) {
    run(
      `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
      [key, value]
    );
  },
};