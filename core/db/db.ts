// core/db/db.ts

import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("app_v4.db");

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