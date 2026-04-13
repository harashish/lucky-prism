import { create } from "zustand";
import { goalRepo, Goal } from "./goal.repo";
import { awardXp } from "../gamification/gamification.service";
import { isExpired, getPeriodStart } from "./goal.service";

type GoalState = {
  goals: (Goal & { steps?: any[] })[];

  loadGoals: (period?: string, archived?: boolean) => void;

  upsertGoal: (data: Partial<Goal>) => number;
  deleteGoal: (id: number) => void;

  completeGoal: (goalId: number) => void;
  toggleArchive: (goalId: number) => void;

  addStep: (goalId: number, title: string) => void;
  toggleStep: (goalId: number, stepId: number) => void;
  updateStep: (stepId: number, title: string) => void;
  deleteStep: (stepId: number) => void;

  showArchived: boolean;
  setShowArchived: (v: boolean) => void;
  currentPeriod?: string;
};

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  showArchived: false,

  setShowArchived: (v) => set({ showArchived: v }),

  // ===== LOAD =====

  loadGoals: (period, archived) => {
    const raw = goalRepo.getAll(
      period as any,
      archived ?? get().showArchived
    );

    // 🔥 AUTO LOGIC
    raw.forEach((g) => {
      if (!g.is_archived && isExpired(g)) {
        if (g.is_completed) {
          goalRepo.toggleArchive(g.id!, 1);
        } else {
          goalRepo.update(g.id!, {
            period_start: getPeriodStart(g.period),
            is_completed: 0,
            completed_at: null,
            was_carried_over: g.was_carried_over ? g.was_carried_over : 1,
          });
        }
      }
    });

    const goals = goalRepo.getAll(
      period as any,
      archived ?? get().showArchived
    );

    const enriched = goals.map((g) => ({
      ...g,
      steps: goalRepo.getSteps(g.id!),
    }));

    set({
      goals: enriched,
      currentPeriod: period,
    });
  },

  // ===== UPSERT =====

  upsertGoal: (data) => {
    let id = data.id;

    if (id) {
      goalRepo.update(id, data);
    } else {
      id = goalRepo.insert(data as Goal);
    }

    const { currentPeriod, showArchived } = get();
    get().loadGoals(currentPeriod, showArchived);

    return id!;
  },
  
    deleteGoal: (id) => {
      goalRepo.delete(id);
      const { currentPeriod, showArchived } = get();
      get().loadGoals(currentPeriod, showArchived);
    },

  // ===== COMPLETE =====

  completeGoal: (goalId) => {
    const goal = goalRepo.getById(goalId);
    if (!goal || goal.is_completed) return;

    goalRepo.complete(goalId);


    awardXp({
        type: "GOAL_COMPLETED",
        difficulty: goal.difficulty,
        period: goal.period,
    });

    const { currentPeriod, showArchived } = get();
    get().loadGoals(currentPeriod, showArchived);
  },

  // ===== ARCHIVE =====

  toggleArchive: (goalId) => {
    const goal = goalRepo.getById(goalId);
    if (!goal) return;

    const newValue = goal.is_archived ? 0 : 1;

    goalRepo.toggleArchive(goalId, newValue);
    const { currentPeriod, showArchived } = get();
    get().loadGoals(currentPeriod, showArchived);
  },

  // ===== STEPS =====

  addStep: (goalId, title) => {
    goalRepo.addStep(goalId, title);
    const { currentPeriod, showArchived } = get();
    get().loadGoals(currentPeriod, showArchived);
  },

  toggleStep: (_, stepId) => {
    goalRepo.toggleStep(stepId);
    const { currentPeriod, showArchived } = get();
    get().loadGoals(currentPeriod, showArchived);
  },

  updateStep: (stepId, title) => {
    goalRepo.updateStep(stepId, title);
  },

  deleteStep: (stepId) => {
    goalRepo.deleteStep(stepId);
    const { currentPeriod, showArchived } = get();
    get().loadGoals(currentPeriod, showArchived);
  },
}));