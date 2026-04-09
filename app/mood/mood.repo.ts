import { getAll, getOne, run } from "../../core/db/db";
import { MOODS } from "./mood.constants";

export type Mood = (typeof MOODS)[number];

export type MoodEntry = {
  id?: number;
  mood: Mood;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  note: string;
  emotions?: string[];
};

// maps raw DB row -> typed object
const mapRow = (r: any): MoodEntry => ({
  id: r.id,
  mood: r.mood,
  date: r.date,
  time: r.time,
  note: r.note,
  emotions: r.emotions ? JSON.parse(r.emotions) : [],
});

export const moodRepo = {
  // returns all entries sorted newest -> oldest
  getAll: (): MoodEntry[] => {
    const rows = getAll(`
      SELECT * FROM mood_entries
      ORDER BY date DESC
    `);

    return rows.map(mapRow);
  },

  // returns entries for given year (used by grid)
  getByYear: (year: number): MoodEntry[] => {
    const rows = getAll(
      `
      SELECT * FROM mood_entries
      WHERE date LIKE ?
      ORDER BY date ASC
      `,
      [`${year}-%`]
    );

    return rows.map(mapRow);
  },

  getByDate: (date: string): MoodEntry | null => {
    return getOne(
      `SELECT * FROM mood_entries WHERE date = ?`,
      [date]
    );
  },

  getById: (id: number): MoodEntry | null => {
    const row = getOne(
      `SELECT * FROM mood_entries WHERE id = ?`,
      [id]
    );

    return row ? mapRow(row) : null;
  },

  // insert or update entry (1 entry per date)
  upsert: (data: MoodEntry): void => {
    run(
      `
      INSERT INTO mood_entries (mood, date, time, emotions, note)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        mood = excluded.mood,
        time = excluded.time,
        emotions = excluded.emotions,
        note = excluded.note
      `,
      [
        data.mood,
        data.date,
        data.time,
        JSON.stringify(data.emotions || []),
        data.note || "",
      ]
    );
  },

  // delete entry by id
  delete: (id: number): void => {
    run(`DELETE FROM mood_entries WHERE id = ?`, [id]);
  },
};