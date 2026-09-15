"use client";

import Link from "next/link";
import { useApp } from "@/hooks/useAppData";
import { PageHeader } from "@/components/layout/Navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { TrendChart } from "@/components/charts/Charts";
import {
  formatDate,
  formatInjectionCountdown,
  formatTimeDisplay,
  getDaysUntilInjection,
  getLastRelevantInjection,
  getMedicationLabel,
  getNextInjectionLabel,
  getNutritionAverages,
  getTreatmentConsistency,
  getWeightProgress,
  hasCompletedScheduledInjection,
  todayISO,
} from "@/lib/utils";
import {
  Syringe,
  Calendar,
  TrendingDown,
  Droplets,
  Beef,
  Wheat,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { ui } from "@/lib/ui-classes";

export default function DashboardPage() {
  const { data } = useApp();
  const { profile, injections, nutrition, weights } = data;

  if (!profile) return null;

  const daysUntil = getDaysUntilInjection(profile, injections);
  const nextInjectionLabel = getNextInjectionLabel(profile, injections);
  const doseComplete = hasCompletedScheduledInjection(profile, injections);
  const lastInjection = getLastRelevantInjection(profile, injections);
  const loggedToday = lastInjection?.date === todayISO();
  const todayNutrition = nutrition.find((n) => n.date === todayISO());
  const weightProgress = getWeightProgress(weights);
  const consistency = getTreatmentConsistency(injections);
  const nutritionAvg = getNutritionAverages(nutrition, 7);

  const weightChartData = weights
    .slice()
    .reverse()
    .slice(-12)
    .map((w) => ({
      date: formatDate(w.date, "MMM d"),
      weight: w.weight,
    }));

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${profile.name}`}
        subtitle="Here's how your journey is going today."
      />

      {/* Injection countdown */}
      <Card className="mb-6 bg-gradient-to-r from-lavender-50 to-rose-50 border-lavender-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center shadow-soft">
              <Syringe className="w-7 h-7 text-lavender-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Next injection</p>
              <p className="font-display text-xl font-bold text-gray-800">
                {formatInjectionCountdown(daysUntil)}
              </p>
              {nextInjectionLabel && (
                <p className="text-xs text-lavender-500 mt-0.5">
                  {nextInjectionLabel}
                  {profile.injectionTime
                    ? ` at ${formatTimeDisplay(profile.injectionTime)}`
                    : ""}
                </p>
              )}
              {loggedToday && doseComplete && daysUntil !== null && daysUntil > 0 && (
                <p className="text-xs text-turquoise-600 mt-1">
                  Today&apos;s dose logged — counting down to your next one
                </p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">
                {getMedicationLabel(profile.medication)} · {profile.currentDosage}
                {profile.dosageUnit}
              </p>
            </div>
          </div>
          <Link href="/injections" className="shrink-0 self-start sm:self-center">
            <Button size="sm">Log injection</Button>
          </Link>
        </div>
      </Card>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <ProgressRing
            value={consistency.percentage}
            max={100}
            color="#a892d4"
            label={`${consistency.percentage}%`}
            sublabel="Consistency"
          />
          <p className="text-xs text-gray-500 mt-2">Treatment adherence</p>
        </Card>

        {weightProgress && (
          <Card className="text-center">
            <div className="text-2xl font-display font-bold text-turquoise-500">
              {weightProgress.change > 0 ? "+" : ""}
              {weightProgress.change.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {weightProgress.latest.unit} total change
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              Since {formatDate(weightProgress.first.date, "MMM d")}
            </p>
          </Card>
        )}

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Beef className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-gray-500">Protein today</span>
          </div>
          <ProgressBar
            value={todayNutrition?.protein ?? 0}
            max={profile.proteinGoal}
            color="bg-rose-300"
            showValue
            unit="g"
          />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-turquoise-400" />
            <span className="text-xs text-gray-500">Water today</span>
          </div>
          <ProgressBar
            value={todayNutrition?.water ?? 0}
            max={profile.waterGoal}
            color="bg-turquoise-300"
            showValue
            unit={profile.waterUnit}
          />
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Weight chart */}
        <Card>
          <CardHeader
            title="Weight trend"
            subtitle="Your progress over time"
            action={
              <Link href="/progress" className={`${ui.linkAccent} text-sm flex items-center gap-1`}>
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            }
          />
          <TrendChart
            data={weightChartData}
            dataKey="weight"
            color="#4db8aa"
            unit={` ${weightProgress?.latest.unit ?? "lbs"}`}
          />
        </Card>

        {/* Nutrition overview */}
        <Card>
          <CardHeader
            title="Nutrition this week"
            subtitle={
              nutritionAvg
                ? `Averaged over ${nutritionAvg.daysLogged} logged days`
                : "Start logging to see trends"
            }
            action={
              <Link href="/nutrition" className={`${ui.linkAccent} text-sm flex items-center gap-1`}>
                Log today <ChevronRight className="w-3 h-3" />
              </Link>
            }
          />
          {nutritionAvg ? (
            <div className="space-y-4">
              <ProgressBar
                label="Calories"
                value={nutritionAvg.calories}
                max={profile.calorieGoal}
                color="bg-lavender-400"
                showValue
              />
              <ProgressBar
                label="Protein"
                value={nutritionAvg.protein}
                max={profile.proteinGoal}
                color="bg-rose-300"
                showValue
                unit="g"
              />
              <ProgressBar
                label="Fiber"
                value={nutritionAvg.fiber}
                max={profile.fiberGoal}
                color="bg-sage-300"
                showValue
                unit="g"
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Wheat className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Log your first meal to track nutrition
            </div>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/injections", label: "Log injection", icon: Syringe, iconClass: "text-lavender-400" },
          { href: "/nutrition", label: "Log nutrition", icon: Beef, iconClass: "text-rose-400" },
          { href: "/symptoms", label: "Log symptoms", icon: Calendar, iconClass: "text-turquoise-400" },
          { href: "/insights", label: "View insights", icon: Sparkles, iconClass: "text-sage-400" },
        ].map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="text-center py-4 hover:shadow-soft transition-shadow">
              <action.icon className={`w-6 h-6 mx-auto mb-2 ${action.iconClass}`} />
              <p className="text-sm font-medium text-gray-700">{action.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
