"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { MEDICATIONS } from "@/lib/constants";
import { defaultMedicationDose, getMedicationLabel } from "@/lib/utils";
import type { GLP1Medication, InjectionMedicationDose } from "@/lib/types";
import { cn } from "@/lib/cn";

interface InjectionMedicationDosesEditorProps {
  doses: InjectionMedicationDose[];
  onChange: (doses: InjectionMedicationDose[]) => void;
  maxLines?: number;
  compact?: boolean;
}

export function InjectionMedicationDosesEditor({
  doses,
  onChange,
  maxLines = 6,
  compact = false,
}: InjectionMedicationDosesEditorProps) {
  const updateLine = (index: number, patch: Partial<InjectionMedicationDose>) => {
    const next = doses.map((d, i) => (i === index ? { ...d, ...patch } : d));
    onChange(next);
  };

  const setMedication = (index: number, medication: GLP1Medication) => {
    const med = MEDICATIONS.find((m) => m.id === medication)!;
    updateLine(index, {
      medication,
      dosage: med.commonDosages[0],
      dosageUnit: med.defaultUnit,
    });
  };

  const removeLine = (index: number) => {
    if (doses.length <= 1) return;
    onChange(doses.filter((_, i) => i !== index));
  };

  const addLine = () => {
    if (doses.length >= maxLines) return;
    const used = new Set(doses.map((d) => d.medication));
    const nextMed =
      MEDICATIONS.find((m) => !used.has(m.id))?.id ?? "other";
    onChange([...doses, defaultMedicationDose(nextMed as GLP1Medication)]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-700">
          Medications in this injection
        </p>
        {doses.length > 1 && (
          <span className="text-xs text-lavender-500">Combined in one shot</span>
        )}
      </div>

      <div className="space-y-3">
        {doses.map((line, index) => {
          const med = MEDICATIONS.find((m) => m.id === line.medication)!;
          return (
            <div
              key={`${index}-${line.medication}`}
              className={cn(
                "rounded-2xl border border-lavender-100/90 bg-gradient-to-br from-white to-lavender-50/30 p-3 sm:p-4",
                compact && "p-3"
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {index === 0 ? "Primary" : `Medication ${index + 1}`}
                </span>
                {doses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    className="rounded-lg p-1.5 text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-600 touch-manipulation"
                    aria-label={`Remove ${getMedicationLabel(line.medication)}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  label="Medication"
                  value={line.medication}
                  onChange={(e) =>
                    setMedication(index, e.target.value as GLP1Medication)
                  }
                  options={MEDICATIONS.map((m) => ({
                    value: m.id,
                    label: m.brand,
                  }))}
                />
                <Input
                  label={`Dose (${med.defaultUnit})`}
                  type="number"
                  step="any"
                  min={0}
                  value={String(line.dosage)}
                  onChange={(e) =>
                    updateLine(index, {
                      dosage: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder={`Common: ${med.commonDosages.join(", ")}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {doses.length < maxLines && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={addLine}
        >
          <Plus className="h-4 w-4" />
          Add another medication
        </Button>
      )}
    </div>
  );
}
