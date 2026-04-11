import { getAll, getOne, run } from "../../core/db/db";
import { Difficulty } from "../gamification/difficulty";
import { ChallengeLogAction, Period } from "./challenge.types";

// TYPES

export type ChallengeDefinition = {
  id?: number;
  title: string;
  description?: string;
  difficulty: Difficulty;
  type: Period;
  created_at?: string;
  updated_at?: string;
};

export type UserChallenge = {
  id?: number;
  definition_id: number;
  challenge_type: Period;

  start_date: string;
  weekly_deadline?: string | null;

  is_completed: number;

  created_at?: string;
  updated_at?: string;
};

export type ChallengeTag = {
  id?: number;
  name: string;
  is_default: number; // 1 = nieusuwalny
  color?: string;
};

export type ChallengeLog = {
  id?: number;
  challenge_id: number;
  date: string;
  action: ChallengeLogAction;
};

// Map DB row → frontend model

export const challengeRepo = {

  getDefinitions(): ChallengeDefinition[] {
    return getAll(`SELECT * FROM challenge_definitions`);
  },

  getDefinitionById(id: number): ChallengeDefinition | null {
    return getOne(
      `SELECT * FROM challenge_definitions WHERE id = ?`,
      [id]
    );
  },

  upsertDefinition(
    data: ChallengeDefinition,
    tagIds: number[]
  ) {
    if (data.id) {
      // UPDATE
      run(
        `UPDATE challenge_definitions
        SET title=?, description=?, difficulty=?, type=?, updated_at=?
        WHERE id=?`,
        [
          data.title,
          data.description ?? "",
          data.difficulty,
          data.type,
          new Date().toISOString(),
          data.id,
        ]
      );

      this.setTagsForDefinition(data.id, tagIds);

    } else {
      // INSERT
      run(
        `INSERT INTO challenge_definitions
        (title, description, difficulty, type, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.title,
          data.description ?? "",
          data.difficulty,
          data.type,
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );

      const inserted = getOne<{ id: number }>(
        `SELECT last_insert_rowid() as id`
      );

      if (inserted?.id) {
        this.setTagsForDefinition(inserted.id, tagIds);
      }
    }
  },

  deleteDefinition(id: number) {
    run(`DELETE FROM challenge_definitions WHERE id = ?`, [id]);
  },

  // TAGS

  getTags(): ChallengeTag[] {
    return getAll(`SELECT * FROM challenge_tags`);
  },

  getTagById(id: number): ChallengeTag | null {
    return getOne(
      `SELECT * FROM challenge_tags WHERE id = ?`,
      [id]
    );
  },

  createTag(name: string, color: string, isDefault = 0) {
    run(
      `INSERT INTO challenge_tags (name, color, is_default)
      VALUES (?, ?, ?)`,
      [name, color, isDefault]
    );
  },

  updateTag(id: number, name: string, color: string) {
    run(
      `UPDATE challenge_tags SET name = ?, color = ? WHERE id = ?`,
      [name, color, id]
    );
  },

  deleteTag(id: number) {
    run(`DELETE FROM challenge_tags WHERE id = ?`, [id]);
  },

  getTagsForDefinition(defId: number): ChallengeTag[] {
    return getAll(
      `
      SELECT t.*
      FROM challenge_tags t
      JOIN challenge_definition_tags dt
        ON dt.tag_id = t.id
      WHERE dt.definition_id = ?
      `,
      [defId]
    );
  },

  setTagsForDefinition(defId: number, tagIds: number[]) {
    // clear
    run(
      `DELETE FROM challenge_definition_tags WHERE definition_id = ?`,
      [defId]
    );

    // insert
    tagIds.forEach((tagId) => {
      run(
        `INSERT INTO challenge_definition_tags (definition_id, tag_id)
        VALUES (?, ?)`,
        [defId, tagId]
      );
    });
  },

  isTagUsed(tagId: number): boolean {
    const res = getOne(
      `
      SELECT 1
      FROM challenge_definition_tags dt
      JOIN user_challenges uc
        ON uc.definition_id = dt.definition_id
      WHERE dt.tag_id = ?
      LIMIT 1
      `,
      [tagId]
    );

    return !!res;
  },

  // USER CHALLENGES

  getActiveChallenges(): UserChallenge[] {
    return getAll(
      `SELECT * FROM user_challenges WHERE is_completed = 0`
    );
  },

  getById(id: number): UserChallenge | null {
    return getOne(
      `SELECT * FROM user_challenges WHERE id = ?`,
      [id]
    );
  },

  assignChallenge(definition: ChallengeDefinition): number {
    const start = new Date().toISOString().slice(0, 10);

    let weeklyDeadline: string | null = null;

    if (definition.type === "weekly") {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      weeklyDeadline = d.toISOString().slice(0, 10);
    }

    run(
      `INSERT INTO user_challenges
       (definition_id, challenge_type, start_date, weekly_deadline, is_completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, ?, ?)`,
      [
        definition.id,
        definition.type,
        start,
        weeklyDeadline,
        new Date().toISOString(),
        new Date().toISOString(),
      ]
    );

    const inserted = getOne<{ id: number }>(
      `SELECT last_insert_rowid() as id`
    );

    if (inserted?.id) {
      this.addLog(inserted.id, "assigned");
      return inserted.id;
    }

    return 0;
  },

  completeChallenge(id: number) {
    run(
      `UPDATE user_challenges
       SET is_completed = 1, updated_at = ?
       WHERE id = ?`,
      [new Date().toISOString(), id]
    );

    this.addLog(id, "completed");
  },

  discardChallenge(id: number) {
    run(`DELETE FROM user_challenges WHERE id = ?`, [id]);
    this.addLog(id, "discarded");
  },

  // HISTORY LOGS

  getLogs(challengeId: number): ChallengeLog[] {
    return getAll(
      `SELECT * FROM challenge_logs WHERE challenge_id = ? ORDER BY date DESC`,
      [challengeId]
    );
  },

  addLog(challengeId: number, action: ChallengeLog["action"]) {
    run(
      `INSERT INTO challenge_logs (challenge_id, date, action)
       VALUES (?, ?, ?)`,
      [
        challengeId,
        new Date().toISOString(),
        action,
      ]
    );
  },
};