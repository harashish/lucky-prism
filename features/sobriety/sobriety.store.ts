import { create } from "zustand";
import { sobrietyRepo } from "./sobriety.repo";
import {
  Sobriety,
  SobrietyWithMeta,
} from "./sobriety.repo";
import { enrichSobriety } from "./sobriety.service";

type SobrietyState = {
  list: SobrietyWithMeta[];

  load: () => void;
  getById: (id: number) => SobrietyWithMeta | null;

  upsert: (data: Sobriety) => number;
  delete: (id: number) => void;

  relapse: (id: number, note?: string) => void;
  restart: (id: number) => void;

  getSummary: (id?: number) => any;
};

export const useSobrietyStore = create<SobrietyState>((set, get) => ({
  list: [],

  // =========================
  // LOAD
  // =========================

  load: () => {
    const raw = sobrietyRepo.getAll();

    const enriched = raw.map((s) => {
      const relapses = sobrietyRepo.getRelapses(s.id!);
      return enrichSobriety(s, relapses);
    });

    set({ list: enriched });
  },

  // =========================
  // GET
  // =========================

  getById: (id) => {
    return get().list.find((s) => s.id === id) ?? null;
  },

  // =========================
  // UPSERT (jak w goal)
  // =========================

  upsert: (data) => {
    let id = data.id;

    if (id) {
      sobrietyRepo.update(id, data);
    } else {
      id = sobrietyRepo.insert({
        ...data,
        is_active: data.is_active ?? 1,
      });
    }

    get().load();
    return id!;
  },

  // =========================
  // DELETE
  // =========================

  delete: (id) => {
    sobrietyRepo.delete(id);
    get().load();
  },

  // =========================
  // DOMAIN ACTIONS
  // =========================

  relapse: (id, note) => {
    sobrietyRepo.createRelapse(id, note);
    get().load();
  },

  restart: (id) => {
    sobrietyRepo.restart(id);
    get().load();
  },

  // =========================
  // SUMMARY
  // =========================

  getSummary: (id) => {
    return sobrietyRepo.getSummary(id);
  },
}));