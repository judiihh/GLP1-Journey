export interface FoodMicronutrients {
  sodiumMg?: number;
  sugarG?: number;
  calciumMg?: number;
  ironMg?: number;
  potassiumMg?: number;
  vitamins?: string;
}

export interface AnalyzedFoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  micronutrients?: FoodMicronutrients;
}

export interface FoodAnalysisTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface Glp1MealInsight {
  summary: string;
  proteinRating: "good" | "moderate" | "low";
  fiberRating: "good" | "moderate" | "low";
  portionNote: string;
  tip: string;
}

export interface MealBreakdown {
  source: "ai-photo";
  isEstimate: true;
  analyzedAt: string;
  items: AnalyzedFoodItem[];
  glp1Insight?: Glp1MealInsight;
  confidenceNote: string;
}

export interface FoodAnalysisResult {
  items: AnalyzedFoodItem[];
  totals: FoodAnalysisTotals;
  glp1Insight: Glp1MealInsight;
  confidenceNote: string;
}
