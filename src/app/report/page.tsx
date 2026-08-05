"use client";

import { useState } from "react";
import { useApp } from "@/hooks/useAppData";
import { PageHeader } from "@/components/layout/Navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { generateMedicalSummary } from "@/lib/pdf-report";
import {
  formatDate,
  getDosageHistory,
  getNutritionAverages,
  getTreatmentConsistency,
  getWeightProgress,
  getMedicationLabel,
} from "@/lib/utils";
import { FileText, Download, CheckCircle2, Stethoscope } from "lucide-react";

export default function ReportPage() {
  const { data } = useApp();
  const { profile, injections, weights, sideEffects, nutrition } = data;
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  if (!profile) return null;

  const consistency = getTreatmentConsistency(injections);
  const weightProgress = getWeightProgress(weights);
  const nutritionAvg = getNutritionAverages(nutrition, 14);
  const dosageHistory = getDosageHistory(injections);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateMedicalSummary(data);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } finally {
      setGenerating(false);
    }
  };

  const reportSections = [
    {
      title: "Patient & medication info",
      items: [
        `Name: ${profile.name}`,
        `Medication: ${getMedicationLabel(profile.medication)}`,
        `Current dosage: ${profile.currentDosage}${profile.dosageUnit}`,
        `Treatment since: ${formatDate(profile.startDate)}`,
        `Injection consistency: ${consistency.percentage}%`,
      ],
    },
    {
      title: "Dosage history",
      items:
        dosageHistory.length > 0
          ? dosageHistory.map(
              (d) => `${formatDate(d.date)}: ${d.dosage} ${d.unit}`
            )
          : ["No dosage changes recorded yet"],
    },
    {
      title: "Weight progress",
      items: weightProgress
        ? [
            `Starting: ${weightProgress.first.weight} ${weightProgress.first.unit} (${formatDate(weightProgress.first.date)})`,
            `Current: ${weightProgress.latest.weight} ${weightProgress.latest.unit}`,
            `Change: ${weightProgress.change > 0 ? "+" : ""}${weightProgress.change.toFixed(1)} ${weightProgress.latest.unit}`,
            profile.goalWeight
              ? `Goal: ${profile.goalWeight} ${profile.goalWeightUnit}`
              : "No goal weight set",
          ]
        : ["No weight entries yet"],
    },
    {
      title: "Side effects summary",
      items:
        sideEffects.length > 0
          ? [`${sideEffects.length} symptom logs recorded`, "Detailed breakdown included in PDF"]
          : ["No symptoms logged yet"],
    },
    {
      title: "Nutrition averages (14-day)",
      items: nutritionAvg
        ? [
            `Calories: ${nutritionAvg.calories} kcal/day`,
            `Protein: ${nutritionAvg.protein}g/day`,
            `Fiber: ${nutritionAvg.fiber}g/day`,
            `Water: ${nutritionAvg.water} ${profile.waterUnit}/day`,
          ]
        : ["No nutrition data yet"],
    },
    {
      title: "Recent injections",
      items:
        injections.length > 0
          ? injections.slice(0, 5).map(
              (i) =>
                `${formatDate(i.date)}: ${i.dosage}${i.dosageUnit} (${i.site.replace(/-/g, " ")})`
            )
          : ["No injections logged yet"],
    },
  ];

  return (
    <div>
      <PageHeader
        title="Medical Report"
        subtitle="Generate a PDF summary to share with your healthcare provider"
      />

      {/* Hero card */}
      <Card className="mb-6 bg-gradient-to-br from-lavender-50 via-white to-rose-50 border-lavender-100">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-soft flex items-center justify-center">
            <Stethoscope className="w-10 h-10 text-lavender-400" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-display text-xl font-bold text-gray-800">
              Doctor-ready summary
            </h2>
            <p className="text-gray-500 text-sm mt-1 max-w-lg">
              One tap generates a comprehensive PDF with your medication history,
              dosage changes, weight progress, side effects, nutrition trends, and
              injection records.
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleGenerate}
            loading={generating}
            className="shrink-0"
          >
            {done ? (
              <>
                <CheckCircle2 className="w-5 h-5" /> Downloaded!
              </>
            ) : (
              <>
                <Download className="w-5 h-5" /> Generate PDF
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Preview sections */}
      <div className="grid sm:grid-cols-2 gap-4">
        {reportSections.map((section) => (
          <Card key={section.title}>
            <CardHeader title={section.title} />
            <ul className="space-y-1.5">
              {section.items.map((item, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-lavender-300 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="mt-6 bg-cream-100 border-cream-200">
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          This report is for informational purposes only and is not medical advice.
          Always consult your healthcare provider for treatment decisions.
        </p>
      </Card>
    </div>
  );
}
