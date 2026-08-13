"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { sumFoodTotals } from "@/lib/food-analyze-ai";
import type {
  AnalyzedFoodItem,
  FoodAnalysisResult,
  Glp1MealInsight,
} from "@/lib/food-analyze-types";
import type { UserProfile } from "@/lib/types";
import { cn } from "@/lib/cn";
import {
  AlertCircle,
  Beef,
  Check,
  Leaf,
  Minus,
  Plus,
  Sparkles,
  Trash2,
  Wheat,
} from "lucide-react";

interface FoodAnalysisReviewProps {
  analysis: FoodAnalysisResult;
  profile: UserProfile;
  onConfirm: (analysis: FoodAnalysisResult) => void;
  onCancel: () => void;
}

function RatingBadge({
  label,
  rating,
}: {
  label: string;
  rating: Glp1MealInsight["proteinRating"];
}) {
  const styles = {
    good: "bg-sage-100 text-sage-700",
    moderate: "bg-lavender-100 text-lavender-700",
    low: "bg-rose-100 text-rose-700",
  };

  return (
    <span
      className={cn(
        "text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium",
        styles[rating]
      )}
    >
      {label}: {rating}
    </span>
  );
}

export function FoodAnalysisReview({
  analysis,
  profile,
  onConfirm,
  onCancel,
}: FoodAnalysisReviewProps) {
  const [items, setItems] = useState<AnalyzedFoodItem[]>(analysis.items);
  const [expandedMicro, setExpandedMicro] = useState<string | null>(null);

  const totals = useMemo(() => sumFoodTotals(items), [items]);

  const updateItem = (id: string, patch: Partial<AnalyzedFoodItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirm = () => {
    if (items.length === 0) return;
    onConfirm({
      ...analysis,
      items,
      totals,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-900">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">
          <strong>Estimated values only.</strong> {analysis.confidenceNote} Review
          and edit before adding to your log.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-r from-lavender-50 to-rose-50 border border-lavender-100">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-lavender-500" />
          <p className="text-sm font-medium text-gray-800">GLP-1 meal insight</p>
        </div>
        <p className="text-sm text-gray-600 mb-3">{analysis.glp1Insight.summary}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          <RatingBadge label="Protein" rating={analysis.glp1Insight.proteinRating} />
          <RatingBadge label="Fiber" rating={analysis.glp1Insight.fiberRating} />
        </div>
        <p className="text-xs text-gray-500 mb-1">{analysis.glp1Insight.portionNote}</p>
        <p className="text-xs text-turquoise-700 bg-turquoise-50 rounded-lg px-3 py-2">
          💡 {analysis.glp1Insight.tip}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Calories", value: `~${totals.calories}`, unit: "kcal" },
          { label: "Protein", value: `~${totals.protein}`, unit: "g" },
          { label: "Carbs", value: `~${totals.carbs}`, unit: "g" },
          { label: "Fiber", value: `~${totals.fiber}`, unit: "g" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center p-3 rounded-xl bg-white/80 border border-lavender-50"
          >
            <p className="text-[10px] uppercase tracking-wide text-gray-400">
              {stat.label}
            </p>
            <p className="font-display font-bold text-gray-800">{stat.value}</p>
            <p className="text-[10px] text-gray-400">{stat.unit} est.</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Detected foods</p>
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-white border border-lavender-100/80 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 space-y-2">
                <Input
                  label="Food"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                />
                <Input
                  label="Portion (estimate)"
                  value={item.portion}
                  onChange={(e) => updateItem(item.id, { portion: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-2 rounded-lg text-rose-400 hover:bg-rose-50 touch-manipulation shrink-0"
                aria-label="Remove food item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(
                [
                  ["calories", "kcal"],
                  ["protein", "g P"],
                  ["carbs", "g C"],
                  ["fat", "g F"],
                  ["fiber", "g fib"],
                ] as const
              ).map(([key, suffix]) => (
                <Input
                  key={key}
                  label={`~${suffix}`}
                  type="number"
                  value={String(item[key])}
                  onChange={(e) =>
                    updateItem(item.id, {
                      [key]: parseInt(e.target.value) || 0,
                    })
                  }
                />
              ))}
            </div>

            {item.micronutrients && (
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedMicro(expandedMicro === item.id ? null : item.id)
                  }
                  className="text-xs text-lavender-600 hover:text-lavender-700 flex items-center gap-1"
                >
                  {expandedMicro === item.id ? (
                    <Minus className="w-3 h-3" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                  Micronutrient estimates
                </button>
                {expandedMicro === item.id && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500 bg-lavender-50/50 rounded-lg p-3">
                    {item.micronutrients.sodiumMg != null && (
                      <span>Sodium: ~{item.micronutrients.sodiumMg} mg</span>
                    )}
                    {item.micronutrients.sugarG != null && (
                      <span>Sugar: ~{item.micronutrients.sugarG} g</span>
                    )}
                    {item.micronutrients.calciumMg != null && (
                      <span>Calcium: ~{item.micronutrients.calciumMg} mg</span>
                    )}
                    {item.micronutrients.ironMg != null && (
                      <span>Iron: ~{item.micronutrients.ironMg} mg</span>
                    )}
                    {item.micronutrients.potassiumMg != null && (
                      <span>Potassium: ~{item.micronutrients.potassiumMg} mg</span>
                    )}
                    {item.micronutrients.vitamins && (
                      <span className="col-span-2">
                        Vitamins: {item.micronutrients.vitamins}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Goals today: {profile.calorieGoal} kcal · {profile.proteinGoal}g protein ·{" "}
        {profile.fiberGoal}g fiber
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={items.length === 0}
          className="flex-1"
        >
          <Check className="w-4 h-4" />
          Add estimates to log
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function FoodAnalysisReviewCompact({
  itemCount,
}: {
  itemCount: number;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-turquoise-700 bg-turquoise-50 border border-turquoise-100 rounded-lg px-3 py-2">
      <Beef className="w-3.5 h-3.5 shrink-0" />
      <span>
        {itemCount} analyzed food{itemCount !== 1 ? "s" : ""} added as estimates
      </span>
      <Wheat className="w-3.5 h-3.5 shrink-0 ml-auto opacity-60" />
      <Leaf className="w-3.5 h-3.5 shrink-0 opacity-60" />
    </div>
  );
}
