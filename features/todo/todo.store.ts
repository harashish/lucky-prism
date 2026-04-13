import { create } from "zustand";
import { todoRepo, TodoTask, TodoCategory } from "./todo.repo";
import {
  resolveTaskDifficulty,
  mapCategories,
} from "./todo.service";

import { awardXp } from "../gamification/gamification.service";

type TodoState = {
  categories: TodoCategory[];
  tasks: TodoTask[];

  selectedCategoryId?: number;

  load: () => void;

  setCategory: (id: number | undefined) => void;

  // CATEGORY
  createCategory: (data: TodoCategory) => void;
  updateCategory: (id: number, data: TodoCategory) => void;
  deleteCategory: (id: number) => { ok: boolean; reason?: string };

  // TASK
  createTask: (
    data: Omit<
      TodoTask,
      "id" | "order" | "created_at" | "updated_at" | "is_completed" | "completed_at"
    >
  ) => void;
  updateTask: (id: number, data: Partial<TodoTask>) => void;
  deleteTask: (id: number) => void;

  completeTask: (id: number) => void;
  uncompleteTask: (id: number) => void;

  reorder: (items: { id: number; order: number }[]) => void;

  randomTask: () => TodoTask | null;
};

export const useTodoStore = create<TodoState>((set, get) => ({
  categories: [],
  tasks: [],
  selectedCategoryId: undefined,

  // ===== LOAD =====

  load: () => {
    const categories = todoRepo.getCategories();

    let selected = get().selectedCategoryId;

    if (!selected && categories.length > 0) {
      selected = categories[0].id;
    }

    const tasks = todoRepo.getTasks(selected);

    set({
      categories,
      tasks,
      selectedCategoryId: selected,
    });
  },

  setCategory: (id) => {
    set({ selectedCategoryId: id });
    get().load();
  },

  // ===== CATEGORY =====

  createCategory: (data) => {
    todoRepo.createCategory(data);
    get().load();
  },

  updateCategory: (id, data) => {
    todoRepo.updateCategory(id, data);
    get().load();
  },

  deleteCategory: (id) => {
    const result = todoRepo.deleteCategory(id);

    if (!result.ok) return result;

    const current = get().selectedCategoryId;

    if (current === id) {
      set({ selectedCategoryId: undefined });
    }

    get().load();
    return { ok: true };
  },

  // ===== TASK =====

  createTask: (data) => {
    todoRepo.createTask({
      ...data,
    });
    get().load();
  },

  updateTask: (id, data) => {
    todoRepo.updateTask(id, data);
    get().load();
  },

  deleteTask: (id) => {
    todoRepo.deleteTask(id);
    get().load();
  },

  // ===== COMPLETE + XP =====

  completeTask: (id) => {
    const task = todoRepo.getTaskById(id);
    if (!task) return;

    const result = todoRepo.completeTask(id);

    if (!result.ok || result.alreadyCompleted) {
      get().load();
      return;
    }

    const categories = get().categories;
    const categoryMap = mapCategories(categories);

    const category = categoryMap[task.category_id];
    if (!category) return;

    const difficulty = resolveTaskDifficulty(task, category);

    awardXp({
      type: "TODO_COMPLETED",
      difficulty,
    });

    get().load();
  },


  uncompleteTask: (id: number) => {
  todoRepo.uncompleteTask(id);
  get().load();
},

  // ===== REORDER =====

  reorder: (items) => {
    const categoryId = get().selectedCategoryId;
    if (!categoryId) return;

    todoRepo.reorder(categoryId, items);
    get().load();
  },

  // ===== RANDOM =====

  randomTask: () => {
    return todoRepo.getRandomTask(get().selectedCategoryId);
  },
}));