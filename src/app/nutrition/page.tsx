"use client";

import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useApp } from "@/hooks/useAppData";
import { PageHeader } from "@/components/layout/Navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/Progress";
import { TrendChart } from "@/components/charts/Charts";
import { NutritionHistoryItem } from "@/components/nutrition/NutritionHistoryItem";
import { formatDate, getNutritionAverages, todayISO } from "@/lib/utils";
import { CheckCircle2, Flame, Beef, Wheat, Droplets, Apple } from "lucide-react";

function emptyForm() {
  return { calories: "", protein: "", fiber: "", water: "", notes: "" };
}

export default function NutritionPage() {
  const { data, logNutrition, updateNutrition, deleteNutrition, isSaving } =
    useApp();
  const { profile, nutrition } = data;

  const today = todayISO();
  const [logDate, setLogDate] = useState(today);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);

  const existingForDate = nutrition.find((n) => n.date === logDate);
  const todayLog = nutrition.find((n) => n.date === today);

  const sortedNutrition = useMemo(
    () => [...nutrition].sort((a, b) => b.date.localeCompare(a.date)),
    [nutrition]
  );

  useEffect(() => {
    const entry = nutrition.find((n) => n.date === logDate);
    if (entry) {
      setForm({
        calories: String(entry.calories),
        protein: String(entry.protein),
        fiber: String(entry.fiber),
        water: String(entry.water),
        notes: entry.notes ?? "",
      });
    } else {
      setForm(emptyForm());
    }
  }, [logDate, nutrition]);

  if (!profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logNutrition({
      id: existingForDate?.id ?? uuidv4(),
      date: logDate,
      calories: parseInt(form.calories) || 0,
      protein: parseInt(form.protein) || 0,
      fiber: parseInt(form.fiber) || 0,
      water: parseInt(form.water) || 0,
      notes: form.notes || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const avg = getNutritionAverages(nutrition, 14);
  const chartData = [...nutrition]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map((n) => ({
      date: formatDate(n.date, "MMM d"),
      calories: n.calories,
      protein: n.protein,
    }));

  const todayStats = {
    calories: todayLog?.calories ?? 0,
    protein: todayLog?.protein ?? 0,
    fiber: todayLog?.fiber ?? 0,
    water: todayLog?.water ?? 0,
  };

  return (
    <div>
      <PageHeader
        title="Nutrition"
        subtitle="Log daily intake and review your food history"
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-xs text-gray-500">Today</p>
          <p className="font-display text-lg font-bold text-gray-800 mt-1">
            {todayStats.calories} kcal
          </p>
          <p className="text-xs text-lavender-500 mt-0.5">
            {todayLog ? "Logged" : "Not logged yet"}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">14-day average</p>
          <p className="font-display text-lg font-bold text-gray-800 mt-1">
            {avg ? `${avg.calories} kcal` : "—"}
          </p>
          <p className="text-xs text-lavender-500 mt-0.5">
            {avg ? `${avg.protein}g protein` : "Log daily to see averages"}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Total logged</p>
          <p className="font-display text-lg font-bold text-gray-800 mt-1">
            {nutrition.length} day{nutrition.length !== 1 ? "s" : ""}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Calories",
            value: todayStats.calories,
            max: profile.calorieGoal,
            icon: Flame,
            color: "bg-lavender-400",
          },
          {
            label: "Protein",
            value: todayStats.protein,
            max: profile.proteinGoal,
            icon: Beef,
            color: "bg-rose-300",
            unit: "g",
          },
          {
            label: "Fiber",
            value: todayStats.fiber,
            max: profile.fiberGoal,
            icon: Wheat,
            color: "bg-sage-300",
            unit: "g",
          },
          {
            label: "Water",
            value: todayStats.water,
            max: profile.waterGoal,
            icon: Droplets,
            color: "bg-turquoise-300",
            unit: profile.waterUnit,
          },
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
        <Card>
          <CardHeader
            title="Log nutrition"
            subtitle={
              existingForDate
                ? `Update entry for ${formatDate(logDate, "EEEE, MMM d")}`
                : `New entry for ${formatDate(logDate, "EEEE, MMM d")}`
            }
          />
          {saved ? (
            <div className="flex flex-col items-center py-8 text-turquoise-500">
              <CheckCircle2 className="w-12 h-12 mb-3" />
              <p className="font-medium">Nutrition saved!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Date"
                type="date"
                value={logDate}
                max={today}
                onChange={(e) => setLogDate(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Calories"
                  type="number"
                  placeholder="0"
                  value={form.calories}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, calories: e.target.value }))
                  }
                />
                <Input
                  label="Protein (g)"
                  type="number"
                  placeholder="0"
                  value={form.protein}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, protein: e.target.value }))
                  }
                />
                <Input
                  label="Fiber (g)"
                  type="number"
                  placeholder="0"
                  value={form.fiber}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fiber: e.target.value }))
                  }
                />
                <Input
                  label={`Water (${profile.waterUnit})`}
                  type="number"
                  placeholder="0"
                  value={form.water}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, water: e.target.value }))
                  }
                />
              </div>
              <Textarea
                label="Notes"
                rows={2}
                placeholder="What did you eat today? How was your appetite?"
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
              <Button type="submit" className="w-full" loading={isSaving}>
                {existingForDate
                  ? "Update nutrition log"
                  : "Save nutrition log"}
              </Button>
            </form>
          )}
        </Card>

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

      <Card className="mb-6">
        <CardHeader
          title="Nutrition history"
          subtitle="Tap edit or delete on any entry"
        />
        {sortedNutrition.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Apple className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No nutrition logs yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedNutrition.map((entry) => (
              <NutritionHistoryItem
                key={entry.id}
                log={entry}
                profile={profile}
                onUpdate={updateNutrition}
                onDelete={deleteNutrition}
                isSaving={isSaving}
              />
            ))}
          </div>
        )}
      </Card>

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
