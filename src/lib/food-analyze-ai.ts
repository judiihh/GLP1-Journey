import { v4 as uuidv4 } from "uuid";
import type {
  AnalyzedFoodItem,
  FoodAnalysisResult,
  FoodAnalysisTotals,
  Glp1MealInsight,
} from "./food-analyze-types";
import type { UserProfile } from "./types";
import { getMedicationLabel } from "./utils";

/** Current Groq vision model — see https://console.groq.com/docs/vision */
export const FOOD_VISION_MODEL = "qwen/qwen3.6-27b";

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function rating(value: unknown): Glp1MealInsight["proteinRating"] {
  if (value === "good" || value === "moderate" || value === "low") return value;
  return "moderate";
}

export function buildFoodAnalyzePrompt(profile: UserProfile): string {
  return `You are a nutrition assistant for people on GLP-1 medications (${getMedicationLabel(profile.medication)}).
Analyze the meal photo and return JSON ONLY — no markdown.

User daily goals: ${profile.calorieGoal} kcal, ${profile.proteinGoal}g protein, ${profile.fiberGoal}g fiber.

Identify each visible food item with estimated portion. All numbers are ESTIMATES from visual analysis only.

Return this exact JSON shape:
{
  "items": [
    {
      "name": "Food name",
      "portion": "approx. portion description",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "fiber": 0,
      "micronutrients": {
        "sodiumMg": 0,
        "sugarG": 0,
        "calciumMg": 0,
        "ironMg": 0,
        "potassiumMg": 0,
        "vitamins": "optional short note"
      }
    }
  ],
  "glp1Insight": {
    "summary": "1-2 sentence meal summary",
    "proteinRating": "good|moderate|low",
    "fiberRating": "good|moderate|low",
    "portionNote": "portion size note for GLP-1 users",
    "tip": "one practical improvement tip"
  },
  "confidenceNote": "Brief note that values are visual estimates only"
}

Rules:
- List each distinct food separately (not one lump sum).
- Use realistic estimates; if unsure, note in portion field.
- proteinRating/fiberRating compare to GLP-1 goals (${profile.proteinGoal}g protein, ${profile.fiberGoal}g fiber per day).
- Be supportive and non-medical.`;
}

function parseItem(raw: Record<string, unknown>): AnalyzedFoodItem {
  const micro = raw.micronutrients as Record<string, unknown> | undefined;
  return {
    id: uuidv4(),
    name: str(raw.name, "Unknown food"),
    portion: str(raw.portion, "Estimated portion"),
    calories: num(raw.calories),
    protein: num(raw.protein),
    carbs: num(raw.carbs),
    fat: num(raw.fat),
    fiber: num(raw.fiber),
    micronutrients: micro
      ? {
          sodiumMg: num(micro.sodiumMg ?? micro.sodium_mg) || undefined,
          sugarG: num(micro.sugarG ?? micro.sugar_g) || undefined,
          calciumMg: num(micro.calciumMg ?? micro.calcium_mg) || undefined,
          ironMg: num(micro.ironMg ?? micro.iron_mg) || undefined,
          potassiumMg: num(micro.potassiumMg ?? micro.potassium_mg) || undefined,
          vitamins: str(micro.vitamins) || undefined,
        }
      : undefined,
  };
}

export function sumFoodTotals(items: AnalyzedFoodItem[]): FoodAnalysisTotals {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
      fiber: acc.fiber + item.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

export function parseFoodAnalysis(
  raw: string,
  profile: UserProfile
): FoodAnalysisResult {
  let parsed: Record<string, unknown>;
  try {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    parsed = JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    throw new Error("Could not read the food analysis. Try another photo.");
  }

  const itemsRaw = parsed.items;
  if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
    throw new Error("No foods detected in this photo. Try a clearer image.");
  }

  const items = itemsRaw.map((item) =>
    parseItem(item as Record<string, unknown>)
  );
  const totals = sumFoodTotals(items);

  const insightRaw = (parsed.glp1Insight ?? {}) as Record<string, unknown>;
  const glp1Insight: Glp1MealInsight = {
    summary: str(
      insightRaw.summary,
      "This meal was analyzed from your photo."
    ),
    proteinRating: rating(insightRaw.proteinRating),
    fiberRating: rating(insightRaw.fiberRating),
    portionNote: str(
      insightRaw.portionNote,
      "Eat slowly and stop when comfortably full."
    ),
    tip: str(
      insightRaw.tip,
      `Aim for ${profile.proteinGoal}g protein across the day on GLP-1.`
    ),
  };

  return {
    items,
    totals,
    glp1Insight,
    confidenceNote: str(
      parsed.confidenceNote,
      "Nutritional values are AI estimates based on the photo — not exact measurements."
    ),
  };
}

export async function callGroqFoodVision(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
  profile: UserProfile
): Promise<string> {
  const systemPrompt = buildFoodAnalyzePrompt(profile);
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: FOOD_VISION_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this meal photo. Return JSON only with per-food estimates.",
            },
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      temperature: 0.4,
      max_completion_tokens: 2048,
      response_format: { type: "json_object" },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const raw = data?.error?.message ?? "Could not analyze this photo right now.";
    const message =
      res.status === 429
        ? "Rate limit reached. Wait a moment and try again."
        : raw;
    throw new Error(message);
  }

  const reply = data?.choices?.[0]?.message?.content?.trim() ?? "";
  if (!reply) {
    throw new Error("Empty response from food analyzer.");
  }

  return reply;
}
