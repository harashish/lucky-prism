import { todoRepo, TodoTask, TodoCategory } from "./todo.repo";
import { Difficulty } from "../gamification/difficulty";

// ===== RESOLVE DIFFICULTY =====

export function resolveTaskDifficulty(
  task: TodoTask,
  category: TodoCategory
): Difficulty {
  return (task.custom_difficulty ?? category.difficulty) as Difficulty;
}

// ===== GET CATEGORY MAP (helper) =====

export function mapCategories(categories: TodoCategory[]) {
  const map: Record<number, TodoCategory> = {};

  categories.forEach((c) => {
    if (c.id) map[c.id] = c;
  });

  return map;
}