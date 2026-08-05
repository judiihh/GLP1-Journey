"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useApp } from "@/hooks/useAppData";
import { PageHeader } from "@/components/layout/Navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { TrendChart } from "@/components/charts/Charts";
import { WeightHistoryItem } from "@/components/progress/WeightHistoryItem";
import { ProgressRing } from "@/components/ui/Progress";
import { formatDate, getWeightProgress, todayISO } from "@/lib/utils";
import { CheckCircle2, Scale, Ruler, Target } from "lucide-react";

export default function ProgressPage() {
  const { data, logWeight, updateWeight, deleteWeight, logMeasurement, isSaving } =
    useApp();
  const { profile, weights, measurements } = data;

  const [weight, setWeight] = useState("");
  const [weightDate, setWeightDate] = useState(todayISO());
  const [weightNotes, setWeightNotes] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [measureDate, setMeasureDate] = useState(todayISO());
  const [saved, setSaved] = useState(false);

  if (!profile) return null;

  const progress = getWeightProgress(weights);
  const unit = weights[0]?.unit ?? profile.goalWeightUnit;

  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    await logWeight({
      id: uuidv4(),
      date: weightDate,
      weight: parseFloat(weight),
      unit,
      notes: weightNotes || undefined,
    });
    setWeight("");
    setWeightNotes("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleMeasureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logMeasurement({
      id: uuidv4(),
      date: measureDate,
      waist: waist ? parseFloat(waist) : undefined,
      hips: hips ? parseFloat(hips) : undefined,
      unit: "in",
    });
    setWaist("");
    setHips("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const chartData = progress
    ? progress.sorted.map((w) => ({
        date: formatDate(w.date, "MMM d"),
        weight: w.weight,
      }))
    : [];

  const goalProgress =
    profile.goalWeight && progress
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              ((progress.first.weight - progress.latest.weight) /
                (progress.first.weight - profile.goalWeight)) *
                100
            )
          )
        )
      : null;

  return (
    <div>
      <PageHeader
        title="Progress"
        subtitle="Track your weight, measurements, and goals"
      />

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {progress && (
          <>
            <Card className="text-center">
              <Scale className="w-5 h-5 mx-auto text-lavender-400 mb-2" />
              <p className="font-display text-2xl font-bold text-gray-800">
                {progress.latest.weight} {progress.latest.unit}
              </p>
              <p className="text-xs text-gray-500 mt-1">Current weight</p>
            </Card>
            <Card className="text-center">
              <p className="font-display text-2xl font-bold text-turquoise-500">
                {progress.change > 0 ? "+" : ""}
                {progress.change.toFixed(1)} {progress.latest.unit}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total change</p>
            </Card>
          </>
        )}
        {profile.goalWeight && (
          <Card className="text-center">
            <Target className="w-5 h-5 mx-auto text-rose-400 mb-2" />
            <p className="font-display text-2xl font-bold text-gray-800">
              {profile.goalWeight} {profile.goalWeightUnit}
            </p>
            <p className="text-xs text-gray-500 mt-1">Goal weight</p>
          </Card>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Weight chart */}
        <Card className="lg:col-span-2">
          <CardHeader title="Weight over time" subtitle="Every entry tells your story" />
          <TrendChart
            data={chartData}
            dataKey="weight"
            color="#4db8aa"
            type="line"
            unit={` ${unit}`}
            height={280}
          />
        </Card>

        {/* Goal progress */}
        {goalProgress !== null && (
          <Card className="flex flex-col items-center justify-center">
            <CardHeader title="Goal progress" />
            <ProgressRing
              value={goalProgress}
              max={100}
              size={120}
              color="#ebb1cb"
              label={`${goalProgress}%`}
              sublabel="to goal"
            />
            <p className="text-xs text-gray-500 mt-4 text-center">
              {profile.goalWeight} {profile.goalWeightUnit} target
            </p>
          </Card>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Log weight */}
        <Card>
          <CardHeader title="Log weight" />
          {saved ? (
            <div className="flex flex-col items-center py-6 text-turquoise-500">
              <CheckCircle2 className="w-10 h-10 mb-2" />
              <p className="font-medium text-sm">Saved!</p>
            </div>
          ) : (
            <form onSubmit={handleWeightSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={`Weight (${unit})`}
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
                <Input
                  label="Date"
                  type="date"
                  value={weightDate}
                  onChange={(e) => setWeightDate(e.target.value)}
                />
              </div>
              <Textarea
                label="Notes"
                rows={2}
                placeholder="Optional notes"
                value={weightNotes}
                onChange={(e) => setWeightNotes(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Save weight
              </Button>
            </form>
          )}
        </Card>

        {/* Log measurements */}
        <Card>
          <CardHeader title="Body measurements" subtitle="Track inches lost too" />
          <form onSubmit={handleMeasureSubmit} className="space-y-4">
            <Input
              label="Date"
              type="date"
              value={measureDate}
              onChange={(e) => setMeasureDate(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Waist (in)"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
              />
              <Input
                label="Hips (in)"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={hips}
                onChange={(e) => setHips(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full">
              <Ruler className="w-4 h-4" /> Save measurements
            </Button>
          </form>
        </Card>
      </div>

      {/* Weight history */}
      <Card>
        <CardHeader
          title="Weight history"
          subtitle="Tap edit or delete on any entry"
        />
        {weights.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Scale className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No weight entries logged yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {weights.map((w) => (
              <WeightHistoryItem
                key={w.id}
                log={w}
                onUpdate={updateWeight}
                onDelete={deleteWeight}
                isSaving={isSaving}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
