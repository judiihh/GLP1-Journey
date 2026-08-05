export type GLP1Medication =
  | "ozempic"
  | "wegovy"
  | "mounjaro"
  | "zepbound"
  | "trulicity"
  | "saxenda"
  | "victoza"
  | "rybelsus"
  | "retatrutide"
  | "other";

export type InjectionSite =
  | "abdomen-left"
  | "abdomen-right"
  | "thigh-left"
  | "thigh-right"
  | "upper-arm-left"
  | "upper-arm-right";

export type SideEffectType =
  | "nausea"
  | "fatigue"
  | "constipation"
  | "appetite-change"
  | "headache"
  | "energy"
  | "diarrhea"
  | "bloating"
  | "heartburn"
  | "dizziness";

export type Severity = 0 | 1 | 2 | 3 | 4;

export interface UserProfile {
  id: string;
  name: string;
  medication: GLP1Medication;
  currentDosage: number;
  dosageUnit: "mg" | "units";
  injectionDay: number; // 0-6, derived from nextInjectionDate (legacy compat)
  nextInjectionDate?: string; // ISO date — next scheduled injection
  injectionTime: string; // HH:mm
  startDate: string;
  goalWeight?: number;
  goalWeightUnit: "lbs" | "kg";
  calorieGoal: number;
  proteinGoal: number;
  fiberGoal: number;
  waterGoal: number; // oz or ml
  waterUnit: "oz" | "ml";
  onboardingComplete: boolean;
  createdAt: string;
}

export interface InjectionLog {
  id: string;
  date: string;
  time: string;
  medication: GLP1Medication;
  dosage: number;
  dosageUnit: "mg" | "units";
  site: InjectionSite;
  notes?: string;
  dosageChanged?: boolean;
  previousDosage?: number;
}

export interface NutritionLog {
  id: string;
  date: string;
  calories: number;
  protein: number;
  fiber: number;
  water: number;
  carbs?: number;
  fat?: number;
  notes?: string;
}

export interface WeightLog {
  id: string;
  date: string;
  weight: number;
  unit: "lbs" | "kg";
  notes?: string;
}

export interface MeasurementLog {
  id: string;
  date: string;
  waist?: number;
  hips?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  unit: "in" | "cm";
}

export interface SideEffectLog {
  id: string;
  date: string;
  effects: {
    type: SideEffectType;
    severity: Severity;
    notes?: string;
  }[];
  energyLevel?: Severity;
  appetiteLevel?: Severity;
  notes?: string;
}

export interface ReminderSettings {
  enabled: boolean;
  daysBefore: number;
  time: string;
}

export interface AppData {
  profile: UserProfile | null;
  injections: InjectionLog[];
  nutrition: NutritionLog[];
  weights: WeightLog[];
  measurements: MeasurementLog[];
  sideEffects: SideEffectLog[];
  reminders: ReminderSettings;
}

export interface PatternInsight {
  id: string;
  type: "side-effect" | "nutrition" | "dosage" | "weight";
  title: string;
  description: string;
  severity: "info" | "watch" | "positive";
  relatedDates: string[];
}

export interface MealPlanItem {
  id: string;
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  fiber: number;
  description: string;
  tips: string;
}

export interface DailyMealPlan {
  date: string;
  meals: MealPlanItem[];
  totalCalories: number;
  totalProtein: number;
  totalFiber: number;
}
