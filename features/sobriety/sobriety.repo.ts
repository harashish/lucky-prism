import { getAll, getOne, run } from "../../core/db/db";

// =========================
// TYPES
// =========================

export interface SobrietyRelapse {
  id?: number;
  sobriety: number;

  occurred_at: string;
  note?: string;
}

export interface Sobriety {
  id?: number;

  name: string;
  description: string;
  motivation_reason: string;

  started_at: string;
  ended_at?: string | null;

  is_active: number; // 0 / 1

  created_at: string;
  updated_at: string;
}

export interface SobrietyWithMeta extends Sobriety {
  relapses: SobrietyRelapse[];
  current_duration: number | null;
}

// =========================
// REPO
// =========================

export const sobrietyRepo = {
  // ===== GET ALL =====
  getAll(): Sobriety[] {
    return getAll<Sobriety>(`
      SELECT * FROM sobriety
      ORDER BY created_at DESC
    `);
  },

  // ===== GET BY ID =====
  getById(id: number): Sobriety | null {
    return (
      getOne<Sobriety>(
        `SELECT * FROM sobriety WHERE id = ?`,
        [id]
      ) ?? null
    );
  },

  // ===== CREATE =====
  insert(data: Sobriety): number {
    const now = new Date().toISOString();

    const result = run(
      `
      INSERT INTO sobriety (
        name,
        description,
        motivation_reason,
        started_at,
        ended_at,
        is_active,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.name,
        data.description ?? "",
        data.motivation_reason,
        data.started_at,
        data.ended_at ?? null,
        data.is_active ?? 1,
        now,
        now,
      ]
    );

    return result.lastInsertRowId as number;
  },

  // ===== UPDATE (PATCH STYLE) =====
  update(id: number, data: Partial<Sobriety>) {
    const fields = Object.keys(data)
      .map((k) => `${k} = ?`)
      .join(", ");

    run(
      `
      UPDATE sobriety
      SET ${fields}, updated_at = ?
      WHERE id = ?
      `,
      [...Object.values(data), new Date().toISOString(), id]
    );
  },

  // ===== DELETE =====
  delete(id: number) {
    run(`DELETE FROM sobriety WHERE id = ?`, [id]);

    // important: cleanup relapses
    run(`DELETE FROM sobriety_relapse WHERE sobriety = ?`, [id]);
  },

  // =========================
  // RELAPSES
  // =========================

  getRelapses(sobrietyId: number): SobrietyRelapse[] {
    return getAll<SobrietyRelapse>(
      `
      SELECT * FROM sobriety_relapse
      WHERE sobriety = ?
      ORDER BY occurred_at DESC
      `,
      [sobrietyId]
    );
  },

  createRelapse(sobrietyId: number, note?: string) {
    const now = new Date().toISOString();

    run(
      `
      INSERT INTO sobriety_relapse (
        sobriety,
        occurred_at,
        note
      )
      VALUES (?, ?, ?)
      `,
      [sobrietyId, now, note ?? ""]
    );

    // backend parity
    run(
      `
      UPDATE sobriety
      SET
        is_active = 0,
        ended_at = ?,
        updated_at = ?
      WHERE id = ?
      `,
      [now, now, sobrietyId]
    );
  },

  // =========================
  // RESTART
  // =========================

  restart(sobrietyId: number) {
    const now = new Date().toISOString();

    run(
      `
      UPDATE sobriety
      SET
        started_at = ?,
        ended_at = NULL,
        is_active = 1,
        updated_at = ?
      WHERE id = ?
      `,
      [now, now, sobrietyId]
    );
  },

  // =========================
  // SUMMARY
  // =========================

  getSummary(sobrietyId?: number) {
    let s: Sobriety | null = null;

    if (sobrietyId) {
      s = getOne<Sobriety>(
        `SELECT * FROM sobriety WHERE id = ?`,
        [sobrietyId]
      );
    } else {
      s = getOne<Sobriety>(
        `
        SELECT * FROM sobriety
        WHERE is_active = 1
        ORDER BY created_at DESC
        LIMIT 1
        `
      );
    }

    if (!s) return null;

    const now = Date.now();
    const start = new Date(s.started_at).getTime();
    const end = s.ended_at
      ? new Date(s.ended_at).getTime()
      : now;

    return {
      id: s.id,
      name: s.name,
      is_active: !!s.is_active,
      duration_seconds: Math.floor((end - start) / 1000),
    };
  },
};