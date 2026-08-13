import { v4 as uuidv4 } from "uuid";
import type {
  AnalyzedFoodItem,
  FoodAnalysisResult,
  MealBreakdown,
} from "./food-analyze-types";

export function compressMealPhoto(file: File): Promise<{
  base64: string;
  mimeType: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read this photo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load this photo."));
      img.onload = () => {
        const maxDim = 1280;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not process this photo."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, 0.82);
        const base64 = dataUrl.split(",")[1] ?? "";
        resolve({ base64, mimeType });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function mergeMealBreakdown(
  existing: MealBreakdown | null | undefined,
  analysis: FoodAnalysisResult
): MealBreakdown {
  const previousItems = existing?.items ?? [];
  return {
    source: "ai-photo",
    isEstimate: true,
    analyzedAt: new Date().toISOString(),
    items: [...previousItems, ...analysis.items.map((item) => ({ ...item, id: uuidv4() }))],
    glp1Insight: analysis.glp1Insight,
    confidenceNote: analysis.confidenceNote,
  };
}

export function formatFoodNotesFromItems(items: AnalyzedFoodItem[]): string {
  return items.map((item) => `${item.name} (${item.portion})`).join("; ");
}
