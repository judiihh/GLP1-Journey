import type { GLP1Medication, InjectionSite, SideEffectType } from "./types";

export const MEDICATIONS: {
  id: GLP1Medication;
  name: string;
  brand: string;
  defaultUnit: "mg" | "units";
  commonDosages: number[];
  frequency: string;
}[] = [
  {
    id: "ozempic",
    name: "Semaglutide",
    brand: "Ozempic",
    defaultUnit: "mg",
    commonDosages: [0.25, 0.5, 1.0, 2.0],
    frequency: "Weekly",
  },
  {
    id: "wegovy",
    name: "Semaglutide",
    brand: "Wegovy",
    defaultUnit: "mg",
    commonDosages: [0.25, 0.5, 1.0, 1.7, 2.4],
    frequency: "Weekly",
  },
  {
    id: "mounjaro",
    name: "Tirzepatide",
    brand: "Mounjaro",
    defaultUnit: "mg",
    commonDosages: [2.5, 5, 7.5, 10, 12.5, 15],
    frequency: "Weekly",
  },
  {
    id: "zepbound",
    name: "Tirzepatide",
    brand: "Zepbound",
    defaultUnit: "mg",
    commonDosages: [2.5, 5, 7.5, 10, 12.5, 15],
    frequency: "Weekly",
  },
  {
    id: "trulicity",
    name: "Dulaglutide",
    brand: "Trulicity",
    defaultUnit: "mg",
    commonDosages: [0.75, 1.5, 3.0, 4.5],
    frequency: "Weekly",
  },
  {
    id: "saxenda",
    name: "Liraglutide",
    brand: "Saxenda",
    defaultUnit: "mg",
    commonDosages: [0.6, 1.2, 1.8, 2.4, 3.0],
    frequency: "Daily",
  },
  {
    id: "victoza",
    name: "Liraglutide",
    brand: "Victoza",
    defaultUnit: "mg",
    commonDosages: [0.6, 1.2, 1.8],
    frequency: "Daily",
  },
  {
    id: "rybelsus",
    name: "Semaglutide (oral)",
    brand: "Rybelsus",
    defaultUnit: "mg",
    commonDosages: [3, 7, 14],
    frequency: "Daily",
  },
  {
    id: "retatrutide",
    name: "Retatrutide",
    brand: "Retatrutide",
    defaultUnit: "mg",
    commonDosages: [1, 2, 3, 4, 8, 12],
    frequency: "Weekly · Investigational",
  },
  {
    id: "other",
    name: "Other GLP-1",
    brand: "Custom",
    defaultUnit: "mg",
    commonDosages: [0.25, 0.5, 1.0, 2.0],
    frequency: "Weekly",
  },
];

export const INJECTION_SITES: {
  id: InjectionSite;
  label: string;
  shortLabel: string;
  zone: "abdomen" | "thigh" | "arm";
}[] = [
  { id: "abdomen-left", label: "Abdomen (Left)", shortLabel: "Abd L", zone: "abdomen" },
  { id: "abdomen-right", label: "Abdomen (Right)", shortLabel: "Abd R", zone: "abdomen" },
  { id: "thigh-left", label: "Thigh (Left)", shortLabel: "Thigh L", zone: "thigh" },
  { id: "thigh-right", label: "Thigh (Right)", shortLabel: "Thigh R", zone: "thigh" },
  { id: "upper-arm-left", label: "Upper Arm (Left)", shortLabel: "Arm L", zone: "arm" },
  { id: "upper-arm-right", label: "Upper Arm (Right)", shortLabel: "Arm R", zone: "arm" },
];

export const SIDE_EFFECTS: {
  id: SideEffectType;
  label: string;
  icon: string;
}[] = [
  { id: "nausea", label: "Nausea", icon: "🤢" },
  { id: "fatigue", label: "Fatigue", icon: "😴" },
  { id: "constipation", label: "Constipation", icon: "🫠" },
  { id: "appetite-change", label: "Appetite Change", icon: "🍽️" },
  { id: "headache", label: "Headache", icon: "🤕" },
  { id: "energy", label: "Low Energy", icon: "⚡" },
  { id: "diarrhea", label: "Diarrhea", icon: "💧" },
  { id: "bloating", label: "Bloating", icon: "🎈" },
  { id: "heartburn", label: "Heartburn", icon: "🔥" },
  { id: "dizziness", label: "Dizziness", icon: "🌀" },
];

export const SEVERITY_LABELS = ["None", "Mild", "Moderate", "Significant", "Severe"];

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const DEFAULT_PROFILE = {
  calorieGoal: 1500,
  proteinGoal: 100,
  fiberGoal: 25,
  waterGoal: 64,
  waterUnit: "oz" as const,
  goalWeightUnit: "lbs" as const,
  dosageUnit: "mg" as const,
  currentDosage: 0.25,
  injectionDay: 0,
  injectionTime: "09:00",
};

export const MEAL_TEMPLATES = [
  {
    name: "Greek Yogurt Parfait",
    mealType: "breakfast" as const,
    calories: 280,
    protein: 22,
    fiber: 4,
    description: "Greek yogurt with berries, chia seeds, and a drizzle of honey",
    tips: "High protein, gentle on stomach. Eat slowly.",
  },
  {
    name: "Veggie Egg Scramble",
    mealType: "breakfast" as const,
    calories: 320,
    protein: 24,
    fiber: 3,
    description: "Soft scrambled eggs with spinach and a small slice of whole grain toast",
    tips: "Easy to digest. Avoid greasy preparations.",
  },
  {
    name: "Protein Smoothie Bowl",
    mealType: "breakfast" as const,
    calories: 300,
    protein: 26,
    fiber: 6,
    description: "Blended banana, protein powder, spinach, and almond milk",
    tips: "Sip slowly if nausea is present.",
  },
  {
    name: "Grilled Chicken Salad",
    mealType: "lunch" as const,
    calories: 380,
    protein: 35,
    fiber: 8,
    description: "Mixed greens, grilled chicken, avocado, cherry tomatoes, olive oil dressing",
    tips: "Portion control is key. Chew thoroughly.",
  },
  {
    name: "Lentil Soup & Crackers",
    mealType: "lunch" as const,
    calories: 340,
    protein: 18,
    fiber: 12,
    description: "Warm lentil vegetable soup with whole grain crackers",
    tips: "Warm foods can be easier on GLP-1 sensitive stomachs.",
  },
  {
    name: "Turkey & Hummus Wrap",
    mealType: "lunch" as const,
    calories: 360,
    protein: 28,
    fiber: 6,
    description: "Whole wheat wrap with turkey, hummus, cucumber, and greens",
    tips: "Eat half and save rest if appetite is low.",
  },
  {
    name: "Baked Salmon & Veggies",
    mealType: "dinner" as const,
    calories: 420,
    protein: 38,
    fiber: 5,
    description: "Baked salmon fillet with roasted zucchini and sweet potato",
    tips: "Omega-3s support overall wellness during treatment.",
  },
  {
    name: "Chicken Stir-Fry",
    mealType: "dinner" as const,
    calories: 390,
    protein: 32,
    fiber: 6,
    description: "Lean chicken with broccoli, bell peppers over cauliflower rice",
    tips: "Low volume, high protein — ideal for reduced appetite.",
  },
  {
    name: "Turkey Meatballs & Zoodles",
    mealType: "dinner" as const,
    calories: 370,
    protein: 30,
    fiber: 4,
    description: "Turkey meatballs with zucchini noodles and marinara",
    tips: "Light but satisfying. Stop when comfortably full.",
  },
  {
    name: "Apple & Almond Butter",
    mealType: "snack" as const,
    calories: 180,
    protein: 4,
    fiber: 5,
    description: "Sliced apple with 1 tbsp almond butter",
    tips: "Fiber-rich snack between meals.",
  },
  {
    name: "Cottage Cheese & Berries",
    mealType: "snack" as const,
    calories: 150,
    protein: 14,
    fiber: 2,
    description: "Low-fat cottage cheese with fresh berries",
    tips: "Quick protein boost without heavy volume.",
  },
  {
    name: "Hard-Boiled Eggs",
    mealType: "snack" as const,
    calories: 140,
    protein: 12,
    fiber: 0,
    description: "Two hard-boiled eggs with everything bagel seasoning",
    tips: "Portable protein when appetite is unpredictable.",
  },
];
