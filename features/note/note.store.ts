import { create } from "zustand";
import { notesRepo, Note } from "./note.repo";

type NotesState = {
  list: Note[];

  load: () => void;
  getById: (id: number) => Note | null;

  upsert: (data: Note) => number;
  delete: (id: number) => void;
};

export const useNotesStore = create<NotesState>((set, get) => ({
  list: [],

  // =========================
  // LOAD
  // =========================

  load: () => {
    const notes = notesRepo.getAll();
    set({ list: notes });
  },

  // =========================
  // GET
  // =========================

  getById: (id) => {
    return get().list.find((n) => n.id === id) ?? null;
  },

  // =========================
  // UPSERT
  // =========================

  upsert: (data) => {
    let id = data.id;

    if (id) {
      notesRepo.update(id, data);
    } else {
      id = notesRepo.insert(data);
    }

    get().load();
    return id!;
  },

  // =========================
  // DELETE
  // =========================

  delete: (id) => {
    notesRepo.delete(id);
    get().load();
  },
}));