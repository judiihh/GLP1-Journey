"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { SIDE_EFFECTS, SEVERITY_LABELS } from "@/lib/constants";
import type { SideEffectLog, SideEffectType, Severity } from "@/lib/types";
import { validateLogDate, sideEffectItems } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface SymptomLogFormProps {
  date: string;
  existing?: SideEffectLog;
  onSave: (log: SideEffectLog) => Promise<void>;
  submitLabel?: string;
  compact?: boolean;
}

function effectsFromLog(log?: SideEffectLog): Record<SideEffectType, Severity> {
  if (!log) return {} as Record<SideEffectType, Severity>;
  return Object.fromEntries(
    sideEffectItems(log).map((e) => [e.type, e.severity])
  ) as Record<SideEffectType, Severity>;
}

export function SymptomLogForm({
  date,
  existing,
  onSave,
  submitLabel = "Save symptoms",
  compact = false,
}: SymptomLogFormProps) {
  const [effects, setEffects] = useState<Record<SideEffectType, Severity>>(
    () => effectsFromLog(existing)
  );
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    setEffects(effectsFromLog(existing));
    setNotes(existing?.notes ?? "");
    setSaved(false);
    setDateError(null);
  }, [existing, date]);

  const setSeverity = (type: SideEffectType, severity: Severity) => {
    setEffects((prev) => ({ ...prev, [type]: severity }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateLogDate(date);
    if (error) {
      setDateError(error);
      return;
    }
    setDateError(null);
    setSaving(true);
    try {
      const activeEffects = Object.entries(effects)
        .filter(([, severity]) => severity >= 1)
        .map(([type, severity]) => ({
          type: type as SideEffectType,
          severity: severity as Severity,
        }));

      await onSave({
        id: existing?.id ?? uuidv4(),
        date,
        effects: activeEffects,
        notes: notes || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center py-6 text-turquoise-500">
        <CheckCircle2 className="w-10 h-10 mb-2" />
        <p className="font-medium text-sm">Symptoms saved — take care of yourself 💜</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "space-y-5"}>
      {dateError && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2.5">
          {dateError}
        </p>
      )}
      {SIDE_EFFECTS.map((symptom) => (
        <div key={symptom.id}>
          <div className="flex items-center gap-2 mb-2">
            <span>{symptom.icon}</span>
            <span className="text-sm font-medium text-gray-700">{symptom.label}</span>
          </div>
          <div className="flex gap-1 sm:gap-1.5 min-w-0">
            {SEVERITY_LABELS.map((label, level) => (
              <button
                key={label}
                type="button"
                onClick={() => setSeverity(symptom.id, level as Severity)}
                aria-label={`${symptom.label}: ${label}`}
                className={`flex-1 min-w-0 min-h-[44px] py-2 rounded-lg text-xs font-medium transition-all touch-manipulation ${
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
        rows={compact ? 2 : 3}
        placeholder="Anything else about how you felt this day?"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <Button type="submit" className="w-full" loading={saving}>
        {submitLabel}
      </Button>
    </form>
  );
}

export function symptomSummaryTags(entry?: SideEffectLog) {
  const effects = sideEffectItems(entry);
  if (effects.length === 0) return [];
  return effects
    .filter((e) => e.severity >= 1)
    .map((e) => ({
      type: e.type,
      label: SIDE_EFFECTS.find((s) => s.id === e.type)?.label ?? e.type,
      severity: e.severity,
    }));
}
