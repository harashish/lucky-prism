import { getAll, getOne, run } from "../../core/db/db";

// =========================
// TYPES
// =========================

export interface Note {
  id?: number;

  content: string;

  created_at: string;
  updated_at: string;
}

// =========================
// REPO
// =========================

export const notesRepo = {
  // ===== GET ALL =====
  getAll(): Note[] {
    return getAll<Note>(`
      SELECT * FROM notes
      ORDER BY updated_at DESC
    `);
  },

  // ===== GET BY ID =====
  getById(id: number): Note | null {
    return (
      getOne<Note>(
        `SELECT * FROM notes WHERE id = ?`,
        [id]
      ) ?? null
    );
  },

  // ===== INSERT =====
  insert(data: Note): number {
    const now = new Date().toISOString();

    const result = run(
      `
      INSERT INTO notes (
        content,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?)
      `,
      [
        data.content,
        now,
        now,
      ]
    );

    return result.lastInsertRowId as number;
  },

  // ===== UPDATE =====
  update(id: number, data: Partial<Note>) {
    const fields = Object.keys(data)
      .map((k) => `${k} = ?`)
      .join(", ");

    run(
      `
      UPDATE notes
      SET ${fields}, updated_at = ?
      WHERE id = ?
      `,
      [...Object.values(data), new Date().toISOString(), id]
    );
  },

  // ===== DELETE =====
  delete(id: number) {
    run(`DELETE FROM notes WHERE id = ?`, [id]);
  },
};