import { create } from "zustand";
import { calculateLevel } from "./levelCalculator";
import { gamificationRepo } from "./gamification.repo";

type XPLog = {
  id: number;
  source: string;
  xp: number;
  created_at: string;
};

type XPPopupData = {
  xp: number;
  levelUp?: boolean;
};

type GamificationState = {
  totalXp: number;
  currentLevel: number;
  xpMultiplier: number;

  logs: XPLog[];

  xpPopup: XPPopupData | null;

  addXp: (xp: number, source?: string) => number;
  showXpPopup: (data: XPPopupData) => void;
  clearXpPopup: () => void;

  setMultiplier: (value: number) => void;
};

const initial = gamificationRepo.getState();

export const useGamificationStore = create<GamificationState>((set, get) => ({
  totalXp: initial.total_xp,
  currentLevel: initial.current_level,
  xpMultiplier: initial.xp_multiplier,
  logs: gamificationRepo.getLogs(),

  xpPopup: null,

addXp: (xp, source = "unknown") => {
  if (xp <= 0) return 0;

  const multiplier = get().xpMultiplier;
  const finalXp = Math.floor(xp * multiplier);

  const prevLevel = get().currentLevel;
  const newTotal = get().totalXp + finalXp;
  const newLevel = calculateLevel(newTotal);

  gamificationRepo.updateState({
    total_xp: newTotal,
    current_level: newLevel,
  });

  gamificationRepo.addLog({
    source,
    xp: finalXp,
  });

  const logs = gamificationRepo.getLogs();

  set({
    totalXp: newTotal,
    currentLevel: newLevel,
    logs,
  });

  get().showXpPopup({
    xp: finalXp,
    levelUp: newLevel > prevLevel,
  });

  return finalXp;
},

  showXpPopup: (data) => set({ xpPopup: data }),
  clearXpPopup: () => set({ xpPopup: null }),

  setMultiplier: (value) => {
    if (![0.5, 1, 1.5, 2].includes(value)) return;
    set({ xpMultiplier: value });
  },
}));