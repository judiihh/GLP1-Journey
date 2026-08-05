"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useApp } from "@/hooks/useAppData";
import { PageHeader } from "@/components/layout/Navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { TrendChart } from "@/components/charts/Charts";
import { formatDate, todayISO } from "@/lib/utils";
import { SIDE_EFFECTS, SEVERITY_LABELS } from "@/lib/constants";
import type { SideEffectType, Severity } from "@/lib/types";
import { CheckCircle2, HeartPulse } from "lucide-react";

export default function SymptomsPage() {
  const { data, logSideEffect } = useApp();
  const { sideEffects } = data;

  const existing = sideEffects.find((s) => s.date === todayISO());
  const [effects, setEffects] = useState<
    Record<SideEffectType, Severity>
  >(
    existing
      ? Object.fromEntries(
          existing.effects.map((e) => [e.type, e.severity])
        ) as Record<SideEffectType, Severity>
      : ({} as Record<SideEffectType, Severity>)
  );
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [saved, setSaved] = useState(false);

  const setSeverity = (type: SideEffectType, severity: Severity) => {
    setEffects((prev) => ({ ...prev, [type]: severity }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeEffects = Object.entries(effects)
      .filter(([, severity]) => severity >= 1)
      .map(([type, severity]) => ({
        type: type as SideEffectType,
        severity: severity as Severity,
      }));

    await logSideEffect({
      id: existing?.id ?? uuidv4(),
      date: todayISO(),
      effects: activeEffects,
      notes: notes || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Build chart data for most common symptoms
  const nauseaData = sideEffects
    .slice(0, 14)
    .reverse()
    .map((s) => ({
      date: formatDate(s.date, "MMM d"),
      severity:
        s.effects.find((e) => e.type === "nausea")?.severity ?? 0,
    }));

  const fatigueData = sideEffects
    .slice(0, 14)
    .reverse()
    .map((s) => ({
      date: formatDate(s.date, "MMM d"),
      severity:
        s.effects.find((e) => e.type === "fatigue")?.severity ?? 0,
    }));

  return (
    <div>
      <PageHeader
        title="Symptoms"
        subtitle="Track how you're feeling — patterns help you and your doctor"
      />

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Log form */}
        <Card>
          <CardHeader
            title="How are you feeling today?"
            subtitle={formatDate(todayISO(), "EEEE, MMM d")}
          />
          {saved ? (
            <div className="flex flex-col items-center py-8 text-turquoise-500">
              <CheckCircle2 className="w-12 h-12 mb-3" />
              <p className="font-medium">Symptoms logged — take care of yourself 💜</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {SIDE_EFFECTS.map((symptom) => (
                <div key={symptom.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span>{symptom.icon}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {symptom.label}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {SEVERITY_LABELS.map((label, level) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() =>
                          setSeverity(symptom.id, level as Severity)
                        }
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                          (effects[symptom.id] ?? 0) === level
                            ? level === 0
                              ? "bg-sage-200 text-sage-700"
                              : level <= 2
                                ? "bg-lavender-200 text-lavender-700"
                                : level <= 3
                                  ? "bg-rose-200 text-rose-700"
                                  : "bg-rose-300 text-rose-800"
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        {level === 0 ? "—" : level}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <Textarea
                label="Additional notes"
                rows={3}
                placeholder="Anything else you'd like to remember about today?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Save today&apos;s symptoms
              </Button>
            </form>
          )}
        </Card>

        {/* Severity legend + charts */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Severity guide" />
            <div className="grid grid-cols-2 gap-2 text-sm">
              {SEVERITY_LABELS.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium ${
                      i === 0
                        ? "bg-sage-100 text-sage-600"
                        : i <= 2
                          ? "bg-lavender-100 text-lavender-600"
                          : "bg-rose-100 text-rose-600"
                    }`}
                  >
                    {i}
                  </span>
                  <span className="text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Nausea trend" subtitle="Last 14 entries" />
            <TrendChart
              data={nauseaData}
              dataKey="severity"
              color="#d48989"
              type="bar"
            />
          </Card>

          <Card>
            <CardHeader title="Fatigue trend" subtitle="Last 14 entries" />
            <TrendChart
              data={fatigueData}
              dataKey="severity"
              color="#a892d4"
              type="bar"
            />
          </Card>
        </div>
      </div>

      {/* Recent log */}
      {sideEffects.length > 0 && (
        <Card>
          <CardHeader title="Recent symptom logs" />
          <div className="space-y-3">
            {sideEffects.slice(0, 7).map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-xl bg-lavender-50/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-800">
                    {formatDate(entry.date, "EEEE, MMM d")}
                  </span>
                  <HeartPulse className="w-4 h-4 text-lavender-400" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.effects.map((e) => {
                    const label = SIDE_EFFECTS.find((s) => s.id === e.type)?.label;
                    return (
                      <span
                        key={e.type}
                        className={`text-xs px-2.5 py-1 rounded-full ${
                          e.severity >= 4
                            ? "bg-rose-100 text-rose-700"
                            : e.severity >= 2
                              ? "bg-lavender-100 text-lavender-700"
                              : "bg-sage-100 text-sage-700"
                        }`}
                      >
                        {label}: {SEVERITY_LABELS[e.severity]}
                      </span>
                    );
                  })}
                </div>
                {entry.notes && (
                  <p className="text-xs text-gray-500 mt-2">{entry.notes}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
