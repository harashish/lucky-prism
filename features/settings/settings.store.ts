import { create } from "zustand";
import { settingsRepo } from "./settings.repo";

type SettingsState = {
  settings: Record<string, string>;

  load: () => void;

  set: (key: string, value: string) => void;
  toggle: (key: string) => void;

  getBool: (key: string) => boolean;
  getString: (key: string) => string;
  getNumber: (key: string) => number;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},

  load: () => {
    const data = settingsRepo.getAll();

    const map: Record<string, string> = {};
    data.forEach((s) => {
      map[s.key] = s.value;
    });

    set({ settings: map });
  },

  set: (key, value) => {
    settingsRepo.set(key, value);

    set({
      settings: {
        ...get().settings,
        [key]: value,
      },
    });
  },

  toggle: (key) => {
    const current = get().settings[key] ?? "1";
    const newValue = current === "1" ? "0" : "1";

    settingsRepo.set(key, newValue);

    set({
      settings: {
        ...get().settings,
        [key]: newValue,
      },
    });
  },

  getBool: (key) => {
    return get().settings[key] === "1";
  },

  getString: (key) => {
    return get().settings[key] ?? "";
  },

  getNumber: (key) => {
    return Number(get().settings[key] ?? 0);
  },
}));