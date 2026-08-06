import type { UserProfile } from "./types";

export const SHELLFISH_KEYWORDS = [
  "shrimp",
  "prawn",
  "crab",
  "lobster",
  "crayfish",
  "crawfish",
  "scallop",
  "mussel",
  "clam",
  "oyster",
  "shellfish",
  "crustacean",
  "langoustine",
] as const;

export const PORK_KEYWORDS = [
  "pork",
  "bacon",
  "ham",
  "prosciutto",
  "pancetta",
  "chorizo",
  "guanciale",
  "lard",
] as const;

export const DUCK_KEYWORDS = ["duck", "foie gras"] as const;

export const DIETARY_EXCLUSION_OPTIONS = [
  {
    key: "excludeShellfish" as const,
    label: "Shellfish & crustaceans",
    description: "Shrimp, crab, lobster, scallops, mussels, etc.",
    category:
      "shellfish and crustaceans (shrimp, crab, lobster, crawfish, scallops, mussels, clams, oysters, etc.)",
    keywords: SHELLFISH_KEYWORDS,
  },
  {
    key: "excludePork" as const,
    label: "Pork & pig products",
    description: "Bacon, ham, prosciutto, pancetta, chorizo, etc.",
    category:
      "pork and pig products (bacon, ham, prosciutto, pancetta, chorizo, etc.)",
    keywords: PORK_KEYWORDS,
  },
  {
    key: "excludeDuck" as const,
    label: "Duck",
    description: "Duck meat and duck products",
    category: "duck and duck products",
    keywords: DUCK_KEYWORDS,
  },
] as const;

export type DietaryExclusionKey = (typeof DIETARY_EXCLUSION_OPTIONS)[number]["key"];

export const DEFAULT_DIETARY_EXCLUSIONS: Pick<
  UserProfile,
  "excludeShellfish" | "excludePork" | "excludeDuck"
> = {
  excludeShellfish: true,
  excludePork: true,
  excludeDuck: true,
};

export function withProfileDefaults(profile: UserProfile): UserProfile {
  return {
    ...profile,
    excludeShellfish:
      profile.excludeShellfish ?? DEFAULT_DIETARY_EXCLUSIONS.excludeShellfish,
    excludePork: profile.excludePork ?? DEFAULT_DIETARY_EXCLUSIONS.excludePork,
    excludeDuck: profile.excludeDuck ?? DEFAULT_DIETARY_EXCLUSIONS.excludeDuck,
  };
}

export function getActiveDietaryExclusions(profile: UserProfile) {
  const normalized = withProfileDefaults(profile);
  const categories: string[] = [];
  const keywords: string[] = [];

  for (const option of DIETARY_EXCLUSION_OPTIONS) {
    if (normalized[option.key]) {
      categories.push(option.category);
      keywords.push(...option.keywords);
    }
  }

  return { categories, keywords };
}

export function mealContainsForbiddenIngredient(
  meal: { name: string; description: string; tips: string },
  profile: UserProfile
): boolean {
  const { keywords } = getActiveDietaryExclusions(profile);
  if (keywords.length === 0) return false;

  const text = `${meal.name} ${meal.description} ${meal.tips}`.toLowerCase();
  return keywords.some((word) => {
    const pattern = new RegExp(
      `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i"
    );
    return pattern.test(text);
  });
}

export function findForbiddenIngredientMeal(
  meals: { name: string; description: string; tips: string }[],
  profile: UserProfile
) {
  return meals.find((meal) => mealContainsForbiddenIngredient(meal, profile));
}

export function dietaryExclusionsSummary(profile: UserProfile): string {
  const { categories } = getActiveDietaryExclusions(profile);
  if (categories.length === 0) return "none";
  return categories.join("; ");
}
