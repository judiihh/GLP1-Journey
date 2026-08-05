"use client";

import { useState } from "react";
import { useApp } from "@/hooks/useAppData";
import { PageHeader } from "@/components/layout/Navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/Progress";
import { generateMealPlan } from "@/lib/utils";
import { generateMealPlanPdf } from "@/lib/pdf-meal-plan";
import type { DailyMealPlan } from "@/lib/types";
import { RefreshCw, Sun, Moon, Coffee, Cookie, Download } from "lucide-react";

const mealIcons = {
  breakfast: Sun,
  lunch: Coffee,
  dinner: Moon,
  snack: Cookie,
};

const mealLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export default function MealsPage() {
  const { data } = useApp();
  const { profile } = data;
  const [plan, setPlan] = useState<DailyMealPlan | null>(null);
  const [downloading, setDownloading] = useState(false);

  if (!profile) return null;

  const generate = () => {
    setPlan(
      generateMealPlan(
        profile.calorieGoal,
        profile.proteinGoal,
        profile.fiberGoal
      )
    );
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

  return (
    <div>
      <PageHeader
        title="Meal Plans"
        subtitle="GLP-1-friendly meals tailored to your nutrition goals"
        action={
          plan ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={handleDownloadPdf}
                loading={downloading}
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button onClick={generate}>
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
            </div>
          ) : (
            <Button onClick={generate}>
              <RefreshCw className="w-4 h-4" />
              Generate plan
            </Button>
          )
        }
      />

      {/* Goals summary */}
      <Card className="mb-6 bg-gradient-to-r from-rose-50 to-lavender-50 border-rose-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-display font-bold text-lavender-600">
              {profile.calorieGoal}
            </p>
            <p className="text-xs text-gray-500">Calorie goal</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-rose-500">
              {profile.proteinGoal}g
            </p>
            <p className="text-xs text-gray-500">Protein goal</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-turquoise-500">
              {profile.fiberGoal}g
            </p>
            <p className="text-xs text-gray-500">Fiber goal</p>
          </div>
        </div>
      </Card>

      {!plan ? (
        <Card className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-lavender-100 flex items-center justify-center mb-4">
            <Sun className="w-8 h-8 text-lavender-400" />
          </div>
          <h3 className="font-display text-lg font-semibold text-gray-800 mb-2">
            Ready for today's meal plan?
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            We'll create a day of GLP-1-friendly meals focused on protein,
            fiber, hydration, and smaller portions that are gentle on your stomach.
          </p>
          <Button size="lg" onClick={generate}>
            Generate my meal plan
          </Button>
        </Card>
      ) : (
        <>
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
                        {mealLabels[meal.mealType]}
                      </p>
                      <h3 className="font-display font-semibold text-gray-800">
                        {meal.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
                  <div className="flex gap-3 text-xs text-gray-500 mb-3">
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
