import type { MealPlanItem } from "./types";

export const MEAL_TYPE_ORDER: MealPlanItem["mealType"][] = [
  "breakfast",
  "morning-snack",
  "lunch",
  "afternoon-snack",
  "dinner",
];

export const MEAL_TYPE_LABELS: Record<MealPlanItem["mealType"], string> = {
  breakfast: "Breakfast",
  "morning-snack": "Morning snack",
  lunch: "Lunch",
  "afternoon-snack": "Afternoon snack",
  dinner: "Dinner",
};

export function sortMealsByType(meals: MealPlanItem[]): MealPlanItem[] {
  return [...meals].sort(
    (a, b) =>
      MEAL_TYPE_ORDER.indexOf(a.mealType) - MEAL_TYPE_ORDER.indexOf(b.mealType)
  );
}

export function mealPlanTotals(meals: MealPlanItem[]) {
  return {
    totalCalories: meals.reduce((s, m) => s + m.calories, 0),
    totalProtein: meals.reduce((s, m) => s + m.protein, 0),
    totalFiber: meals.reduce((s, m) => s + m.fiber, 0),
  };
}

export function scaleMealsToCalorieGoal(
  meals: MealPlanItem[],
  calorieGoal: number
): MealPlanItem[] {
  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  if (totalCalories <= calorieGoal * 1.1) return meals;

  const factor = calorieGoal / totalCalories;
  return meals.map((m) => ({
    ...m,
    calories: Math.round(m.calories * factor),
    protein: Math.round(m.protein * factor),
    fiber: Math.round(m.fiber * factor),
  }));
}
