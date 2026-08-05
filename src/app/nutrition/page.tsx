"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useApp } from "@/hooks/useAppData";
import { PageHeader } from "@/components/layout/Navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/Progress";
import { TrendChart } from "@/components/charts/Charts";
import { formatDate, getNutritionAverages, todayISO } from "@/lib/utils";
import { CheckCircle2, Flame, Beef, Wheat, Droplets } from "lucide-react";

export default function NutritionPage() {
  const { data, logNutrition } = useApp();
  const { profile, nutrition } = data;

  const existing = nutrition.find((n) => n.date === todayISO());
  const [calories, setCalories] = useState(String(existing?.calories ?? ""));
  const [protein, setProtein] = useState(String(existing?.protein ?? ""));
  const [fiber, setFiber] = useState(String(existing?.fiber ?? ""));
  const [water, setWater] = useState(String(existing?.water ?? ""));
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [saved, setSaved] = useState(false);

  if (!profile) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logNutrition({
      id: existing?.id ?? uuidv4(),
      date: todayISO(),
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      fiber: parseInt(fiber) || 0,
      water: parseInt(water) || 0,
      notes: notes || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const avg = getNutritionAverages(nutrition, 14);
  const chartData = nutrition
    .slice(0, 14)
    .reverse()
    .map((n) => ({
      date: formatDate(n.date, "MMM d"),
      calories: n.calories,
      protein: n.protein,
    }));

  const current = {
    calories: parseInt(calories) || 0,
    protein: parseInt(protein) || 0,
    fiber: parseInt(fiber) || 0,
    water: parseInt(water) || 0,
  };

  return (
    <div>
      <PageHeader
        title="Nutrition"
        subtitle={`Track your daily intake — ${formatDate(todayISO(), "EEEE, MMM d")}`}
      />

      {/* Today's progress */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Calories", value: current.calories, max: profile.calorieGoal, icon: Flame, color: "bg-lavender-400" },
          { label: "Protein", value: current.protein, max: profile.proteinGoal, icon: Beef, color: "bg-rose-300", unit: "g" },
          { label: "Fiber", value: current.fiber, max: profile.fiberGoal, icon: Wheat, color: "bg-sage-300", unit: "g" },
          { label: "Water", value: current.water, max: profile.waterGoal, icon: Droplets, color: "bg-turquoise-300", unit: profile.waterUnit },
        ].map((item) => (
          <Card key={item.label}>
            <div className="flex items-center gap-2 mb-3">
              <item.icon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
            <ProgressBar
              value={item.value}
              max={item.max}
              color={item.color}
              showValue
              unit={item.unit}
            />
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Log form */}
        <Card>
          <CardHeader
            title="Today's log"
            subtitle={existing ? "Update your entry" : "Start logging"}
          />
          {saved ? (
            <div className="flex flex-col items-center py-8 text-turquoise-500">
              <CheckCircle2 className="w-12 h-12 mb-3" />
              <p className="font-medium">Nutrition saved!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Calories"
                  type="number"
                  placeholder="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
                <Input
                  label="Protein (g)"
                  type="number"
                  placeholder="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
                <Input
                  label="Fiber (g)"
                  type="number"
                  placeholder="0"
                  value={fiber}
                  onChange={(e) => setFiber(e.target.value)}
                />
                <Input
                  label={`Water (${profile.waterUnit})`}
                  type="number"
                  placeholder="0"
                  value={water}
                  onChange={(e) => setWater(e.target.value)}
                />
              </div>
              <Textarea
                label="Notes"
                rows={2}
                placeholder="What did you eat today? How was your appetite?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Save today&apos;s nutrition
              </Button>
            </form>
          )}
        </Card>

        {/* Trends */}
        <Card>
          <CardHeader
            title="Calorie trend"
            subtitle={
              avg
                ? `14-day avg: ${avg.calories} kcal, ${avg.protein}g protein`
                : "Log daily to see trends"
            }
          />
          <TrendChart
            data={chartData}
            dataKey="calories"
            color="#a892d4"
            unit=" kcal"
          />
        </Card>
      </div>

      {/* GLP-1 nutrition tips */}
      <Card className="bg-gradient-to-r from-turquoise-50 to-sage-50 border-turquoise-100">
        <CardHeader title="GLP-1 nutrition tips" />
        <ul className="space-y-2 text-sm text-gray-600">
          <li>🥩 Prioritize protein (aim for {profile.proteinGoal}g/day) to preserve muscle mass</li>
          <li>💧 Stay hydrated — GLP-1 medications can reduce thirst signals</li>
          <li>🥗 Eat smaller portions slowly; stop when comfortably full</li>
          <li>🌾 Include fiber gradually to support digestive health</li>
          <li>⏰ Try eating at consistent times to manage appetite changes</li>
        </ul>
      </Card>
    </div>
  );
}
