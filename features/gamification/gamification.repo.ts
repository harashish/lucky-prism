import { getAll, getOne, run } from "../../core/db/db";

export type GamificationStateDB = {
  id: number;
  total_xp: number;
  current_level: number;
  xp_multiplier: number;
};

export type XPLog = {
  id: number;
  source: string;
  xp: number;
  created_at: string;
};

export const gamificationRepo = {
  
  // STATE
  getState: (): GamificationStateDB => {
  const res = getOne(`
      SELECT * FROM gamification WHERE id = 1
  `);

  if (!res) {
      return {
      id: 1,
      total_xp: 0,
      current_level: 1,
      xp_multiplier: 1,
      };
  }

  return res;
  },

  updateState: (data: Partial<GamificationStateDB>) => {
    const fields = Object.keys(data)
      .map((k) => `${k} = ?`)
      .join(", ");

    run(
      `UPDATE gamification SET ${fields} WHERE id = 1`,
      Object.values(data)
    );
  },

  // LOGS

  getLogs: (): XPLog[] => {
    const rows = getAll(`
        SELECT * FROM xp_logs
        ORDER BY created_at DESC
    `);

    return rows.map((r) => ({
        id: r.id,
        source: r.source,
        xp: r.xp,
        created_at: r.created_at,
    }));
    },

  addLog: (log: { source: string; xp: number }) => {
    run(
      `
      INSERT INTO xp_logs (source, xp)
      VALUES (?, ?)
      `,
      [log.source, log.xp]
    );
},

  clearLogs: () => {
    run(`DELETE FROM xp_logs`);
  },
};