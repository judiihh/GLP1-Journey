"use client";

import { useState } from "react";
import { useApp } from "@/hooks/useAppData";
import { PageHeader } from "@/components/layout/Navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/Progress";
import { generateMealPlan } from "@/lib/utils";
import { generateMealPlanPdf } from "@/lib/pdf-meal-plan";
import { MEAL_TYPE_LABELS } from "@/lib/meal-plan-shared";
import type { DailyMealPlan } from "@/lib/types";
import {
  Sun,
  Moon,
  Coffee,
  Cookie,
  Download,
  Sparkles,
  Shuffle,
} from "lucide-react";

type PlanSource = "quick" | "ai";

const mealIcons = {
  breakfast: Sun,
  "morning-snack": Cookie,
  lunch: Coffee,
  "afternoon-snack": Cookie,
  dinner: Moon,
};

export default function MealsPage() {
  const { data } = useApp();
  const { profile } = data;
  const [plan, setPlan] = useState<DailyMealPlan | null>(null);
  const [planSource, setPlanSource] = useState<PlanSource | null>(null);
  const [loading, setLoading] = useState<PlanSource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  if (!profile) return null;

  const generateQuick = () => {
    setError(null);
    setLoading("quick");
    try {
      setPlan(
        generateMealPlan(
          profile.calorieGoal,
          profile.proteinGoal,
          profile.fiberGoal
        )
      );
      setPlanSource("quick");
    } finally {
      setLoading(null);
    }
  };

  const generateAi = async () => {
    setError(null);
    setLoading("ai");
    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not generate AI meal plan.");
      }
      setPlan(data.plan);
      setPlanSource("ai");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate plan.");
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (!plan) return;
    setDownloading(true);
    try {
      await generateMealPlanPdf(plan, profile);
    } finally {
      setDownloading(false);
    }
  };

  const planButtons = (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
      <Button
        size={plan ? "md" : "lg"}
        variant={planSource === "quick" ? "primary" : "secondary"}
        onClick={generateQuick}
        loading={loading === "quick"}
        disabled={loading !== null}
        className="w-full sm:w-auto"
      >
        <Shuffle className="w-4 h-4" />
        Quick plan
      </Button>
      <Button
        size={plan ? "md" : "lg"}
        variant={planSource === "ai" ? "primary" : "secondary"}
        onClick={generateAi}
        loading={loading === "ai"}
        disabled={loading !== null}
        className="w-full sm:w-auto"
      >
        <Sparkles className="w-4 h-4" />
        AI meal plan
      </Button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Meal Plans"
        subtitle="GLP-1-friendly meals tailored to your nutrition goals"
        action={
          plan ? (
            <Button
              variant="secondary"
              onClick={handleDownloadPdf}
              loading={downloading}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          ) : undefined
        }
      />

      {/* Goals summary */}
      <Card className="mb-4 bg-gradient-to-r from-rose-50 to-lavender-50 border-rose-100">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-display font-bold text-lavender-600">
              {profile.calorieGoal}
            </p>
            <p className="text-xs text-gray-500">Calorie goal</p>
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-display font-bold text-rose-500">
              {profile.proteinGoal}g
            </p>
            <p className="text-xs text-gray-500">Protein goal</p>
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-display font-bold text-turquoise-500">
              {profile.fiberGoal}g
            </p>
            <p className="text-xs text-gray-500">Fiber goal</p>
          </div>
        </div>
      </Card>

      {/* Plan type buttons — always visible */}
      <Card className="mb-6 py-4 px-4 sm:px-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800">
              {plan ? "Switch or regenerate" : "Choose a plan type"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {plan
                ? "Tap the other option anytime — no need to leave this page."
                : "Quick picks from favorites, or AI creates something new."}
            </p>
          </div>
          {planButtons}
        </div>
        {error && (
          <p className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
      </Card>

      {!plan ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-lavender-100 flex items-center justify-center mb-4">
            <Sun className="w-8 h-8 text-lavender-400" />
          </div>
          <h3 className="font-display text-lg font-semibold text-gray-800 mb-2">
            {`Ready for today's meal plan?`}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {`Five meals per day: breakfast, morning snack, lunch, afternoon snack, and dinner.`}
          </p>
        </Card>
      ) : (
        <>
          {planSource && (
            <p className="text-xs text-gray-500 mb-3 text-center">
              {planSource === "ai"
                ? "✨ AI-generated plan — respects your Settings → Meal preferences"
                : "🎲 Quick plan from curated favorites"}
            </p>
          )}

          {/* Plan totals */}
          <Card className="mb-6">
            <CardHeader title="Today's plan totals" />
            <div className="space-y-3">
              <ProgressBar
                label="Calories"
                value={plan.totalCalories}
                max={profile.calorieGoal}
                color="bg-lavender-400"
                showValue
              />
              <ProgressBar
                label="Protein"
                value={plan.totalProtein}
                max={profile.proteinGoal}
                color="bg-rose-300"
                showValue
                unit="g"
              />
              <ProgressBar
                label="Fiber"
                value={plan.totalFiber}
                max={profile.fiberGoal}
                color="bg-sage-300"
                showValue
                unit="g"
              />
            </div>
          </Card>

          {/* Meals */}
          <div className="grid sm:grid-cols-2 gap-4">
            {plan.meals.map((meal) => {
              const Icon = mealIcons[meal.mealType];
              return (
                <Card key={meal.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-lavender-100 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-lavender-500" />
                    </div>
                    <div>
                      <p className="text-xs text-lavender-500 uppercase tracking-wide">
                        {MEAL_TYPE_LABELS[meal.mealType]}
                      </p>
                      <h3 className="font-display font-semibold text-gray-800">
                        {meal.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
                    <span>{meal.calories} kcal</span>
                    <span>{meal.protein}g protein</span>
                    <span>{meal.fiber}g fiber</span>
                  </div>
                  <div className="p-3 rounded-xl bg-turquoise-50 text-xs text-turquoise-700">
                    💡 {meal.tips}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* GLP-1 meal principles */}
      <Card className="mt-6">
        <CardHeader title="Meal planning principles for GLP-1" />
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="p-4 rounded-xl bg-rose-50">
            <p className="font-medium text-rose-700 mb-1">Protein first</p>
            <p>Build each meal around lean protein to maintain muscle and stay satisfied with smaller portions.</p>
          </div>
          <div className="p-4 rounded-xl bg-lavender-50">
            <p className="font-medium text-lavender-700 mb-1">Gentle on stomach</p>
            <p>Choose soft, cooked, or blended foods when nausea is present. Avoid greasy or very spicy meals.</p>
          </div>
          <div className="p-4 rounded-xl bg-turquoise-50">
            <p className="font-medium text-turquoise-700 mb-1">Hydration matters</p>
            <p>Drink water between meals. Dehydration can worsen side effects like constipation and fatigue.</p>
          </div>
          <div className="p-4 rounded-xl bg-sage-50">
            <p className="font-medium text-sage-700 mb-1">Portion awareness</p>
            <p>Your appetite may change significantly. Use smaller plates and eat slowly to recognize fullness.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
