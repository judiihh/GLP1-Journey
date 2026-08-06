import { MEAL_TEMPLATES } from "./constants";
import {
  dietaryExclusionsSummary,
  findForbiddenIngredientMeal,
  getActiveDietaryExclusions,
} from "./dietary-preferences";
import type { DailyMealPlan, MealPlanItem, UserProfile } from "./types";
import { getMedicationLabel } from "./utils";
import {
  mealPlanTotals,
  scaleMealsToCalorieGoal,
  sortMealsByType,
} from "./meal-plan-shared";

const VALID_MEAL_TYPES = new Set<MealPlanItem["mealType"]>([
  "breakfast",
  "morning-snack",
  "lunch",
  "afternoon-snack",
  "dinner",
]);

const REQUIRED_MEAL_TYPES: MealPlanItem["mealType"][] = [
  "breakfast",
  "morning-snack",
  "lunch",
  "afternoon-snack",
  "dinner",
];

const TEMPLATE_NAMES = new Set(
  MEAL_TEMPLATES.map((m) => m.name.toLowerCase().trim())
);

const VARIETY_THEMES = [
  "Mediterranean-inspired",
  "Asian-fusion light",
  "Latin-inspired",
  "Classic American comfort (GLP-1 friendly)",
  "Fresh spring/summer",
  "Cozy fall/winter",
  "Meal-prep friendly",
  "No-cook and minimal prep",
] as const;

/** How many meals may reuse an exact quick-plan template name before we reject. */
export const MAX_TEMPLATE_NAME_OVERLAP = 0;

export function countTemplateNameOverlap(meals: MealPlanItem[]): number {
  return meals.filter((m) =>
    TEMPLATE_NAMES.has(m.name.toLowerCase().trim())
  ).length;
}

function pickVarietyTheme(): string {
  return VARIETY_THEMES[Math.floor(Math.random() * VARIETY_THEMES.length)];
}

export function buildMealPlanUserMessage(profile: UserProfile): string {
  const theme = pickVarietyTheme();
  const exclusions = dietaryExclusionsSummary(profile);
  return `Create a completely NEW GLP-1-friendly meal plan for today. Theme hint: ${theme}. Every meal name must be original — do not reuse any name from the forbidden list. Dietary exclusions: ${exclusions}. Return JSON only.`;
}

export function buildMealPlanPrompt(profile: UserProfile): string {
  const forbiddenNames = MEAL_TEMPLATES.map((m) => m.name).join(", ");
  const { categories } = getActiveDietaryExclusions(profile);
  const exclusionsBlock =
    categories.length > 0
      ? categories.map((c) => `- ${c}`).join("\n")
      : "- None configured";

  return `You are a creative GLP-1-friendly meal planner. Your job is to invent ORIGINAL meals — not copy a fixed menu.

User context:
- Name: ${profile.name || "User"}
- Medication: ${getMedicationLabel(profile.medication)}
- Daily goals: ${profile.calorieGoal} kcal, ${profile.proteinGoal}g protein, ${profile.fiberGoal}g fiber

CRITICAL — dietary exclusions (NEVER include these in any meal):
${exclusionsBlock}
Use chicken, turkey, fish (non-shellfish), eggs, dairy, legumes, tofu, beef, lamb, or plant proteins instead when avoiding the above.

CRITICAL — originality rules:
- Do NOT use any of these exact meal names (forbidden): ${forbiddenNames}
- Do NOT paraphrase those names too closely (e.g. "Greek yogurt parfait" → still too similar)
- Invent fresh meal names and descriptions every time
- You may use similar ingredients and GLP-1-friendly principles, but each plan should feel new

Style to match (principles only — not specific dishes):
- Lean protein at every meal; smaller portions; gentle on the stomach
- Breakfast ~250–350 kcal; morning snack ~120–200 kcal; lunch ~320–400 kcal; afternoon snack ~120–200 kcal; dinner ~350–450 kcal
- Soft textures, low grease, easy digestion when nausea is a concern
- Practical home-cooking ideas with common grocery ingredients

Requirements:
- Return exactly 5 meals: breakfast, morning-snack, lunch, afternoon-snack, dinner (one of each mealType)
- Aim daily totals near: ${profile.calorieGoal} kcal, ${profile.proteinGoal}g protein, ${profile.fiberGoal}g fiber
- Each meal: name, mealType, calories, protein, fiber, description, tips
- Tips: eat slowly, portion control, nausea-friendly swaps, hydration
- Educational only — not medical advice

Respond with ONLY valid JSON:
{
  "meals": [
    {
      "name": "string",
      "mealType": "breakfast" | "morning-snack" | "lunch" | "afternoon-snack" | "dinner",
      "calories": number,
      "protein": number,
      "fiber": number,
      "description": "string",
      "tips": "string"
    }
  ]
}`;
}

function parseJsonFromReply(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(jsonText);
}

function isMealItem(value: unknown): value is Omit<MealPlanItem, "id"> {
  if (!value || typeof value !== "object") return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.name === "string" &&
    typeof m.mealType === "string" &&
    VALID_MEAL_TYPES.has(m.mealType as MealPlanItem["mealType"]) &&
    typeof m.calories === "number" &&
    typeof m.protein === "number" &&
    typeof m.fiber === "number" &&
    typeof m.description === "string" &&
    typeof m.tips === "string" &&
    m.calories >= 0 &&
    m.protein >= 0 &&
    m.fiber >= 0
  );
}

export function parseAiMealPlan(
  raw: string,
  profile: UserProfile,
  date: string
): DailyMealPlan {
  let parsed: unknown;
  try {
    parsed = parseJsonFromReply(raw);
  } catch {
    throw new Error("Could not parse the AI meal plan. Please try again.");
  }

  const mealsRaw = (parsed as { meals?: unknown })?.meals;
  if (!Array.isArray(mealsRaw)) {
    throw new Error("Invalid meal plan format from AI.");
  }

  const meals: MealPlanItem[] = mealsRaw
    .filter(isMealItem)
    .map((m, i) => ({
      ...m,
      id: `ai-${m.mealType}-${i}`,
      calories: Math.round(m.calories),
      protein: Math.round(m.protein),
      fiber: Math.round(m.fiber),
    }));

  const typesPresent = new Set(meals.map((m) => m.mealType));
  for (const required of REQUIRED_MEAL_TYPES) {
    if (!typesPresent.has(required)) {
      throw new Error(`AI plan missing ${required}. Please try again.`);
    }
  }

  const overlap = countTemplateNameOverlap(meals);
  if (overlap > MAX_TEMPLATE_NAME_OVERLAP) {
    throw new Error(
      "AI reused quick-plan meals. Tap AI meal plan again for fresh options."
    );
  }

  const forbiddenMeal = findForbiddenIngredientMeal(meals, profile);
  if (forbiddenMeal) {
    throw new Error(
      "AI included an excluded ingredient. Tap AI meal plan again or update Settings → Meal preferences."
    );
  }

  const scaled = scaleMealsToCalorieGoal(meals, profile.calorieGoal);
  const sorted = sortMealsByType(scaled);
  const totals = mealPlanTotals(sorted);

  return {
    date,
    meals: sorted,
    ...totals,
  };
}
