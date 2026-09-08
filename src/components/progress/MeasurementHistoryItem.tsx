"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate, mergeMeasurementLog, todayISO, validateLogDate } from "@/lib/utils";
import type { MeasurementLog } from "@/lib/types";
import { Ruler, Pencil, Trash2, Check, X } from "lucide-react";

function formatParts(log: MeasurementLog): string[] {
  const parts: string[] = [];
  if (log.waist != null) parts.push(`Waist ${log.waist}"`);
  if (log.hips != null) parts.push(`Hips ${log.hips}"`);
  if (log.leftArm != null) parts.push(`Left arm ${log.leftArm}"`);
  if (log.rightArm != null) parts.push(`Right arm ${log.rightArm}"`);
  return parts;
}

function optionalMeasurement(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toFieldValue(value?: number): string {
  return value != null ? String(value) : "";
}

interface MeasurementHistoryItemProps {
  log: MeasurementLog;
  onUpdate: (log: MeasurementLog, previousDate: string) => Promise<void>;
  onDelete: (date: string) => Promise<void>;
  isSaving: boolean;
}

export function MeasurementHistoryItem({
  log,
  onUpdate,
  onDelete,
  isSaving,
}: MeasurementHistoryItemProps) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(log.date);
  const [waist, setWaist] = useState(toFieldValue(log.waist));
  const [hips, setHips] = useState(toFieldValue(log.hips));
  const [leftArm, setLeftArm] = useState(toFieldValue(log.leftArm));
  const [rightArm, setRightArm] = useState(toFieldValue(log.rightArm));

  const resetForm = () => {
    setDate(log.date);
    setWaist(toFieldValue(log.waist));
    setHips(toFieldValue(log.hips));
    setLeftArm(toFieldValue(log.leftArm));
    setRightArm(toFieldValue(log.rightArm));
  };

  const handleSave = async () => {
    if (validateLogDate(date)) return;

    await onUpdate(
      {
        ...log,
        date,
        waist: optionalMeasurement(waist),
        hips: optionalMeasurement(hips),
        leftArm: optionalMeasurement(leftArm),
        rightArm: optionalMeasurement(rightArm),
        unit: log.unit,
      },
      log.date
    );
    setEditing(false);
  };

  const handleDelete = async () => {
    const parts = formatParts(log);
    const summary = parts.length > 0 ? parts.join(", ") : "this entry";
    if (!confirm(`Delete measurements from ${formatDate(log.date)} (${summary})?`)) {
      return;
    }
    await onDelete(log.date);
  };

  const handleCancel = () => {
    resetForm();
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="p-4 rounded-xl bg-white border-2 border-lavender-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-800">Edit measurements</p>
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cancel edit"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Input
          label="Date"
          type="date"
          value={date}
          max={todayISO()}
          error={validateLogDate(date) ?? undefined}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Waist (in)"
            type="number"
            step="0.1"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
          />
          <Input
            label="Hips (in)"
            type="number"
            step="0.1"
            value={hips}
            onChange={(e) => setHips(e.target.value)}
          />
          <Input
            label="Left arm (in)"
            type="number"
            step="0.1"
            value={leftArm}
            onChange={(e) => setLeftArm(e.target.value)}
          />
          <Input
            label="Right arm (in)"
            type="number"
            step="0.1"
            value={rightArm}
            onChange={(e) => setRightArm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleSave}
            loading={isSaving}
            className="flex-1"
          >
            <Check className="w-4 h-4" /> Save changes
          </Button>
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  const parts = formatParts(log);

  return (
    <div className="p-3 rounded-xl bg-gradient-to-r from-lavender-50/60 to-rose-50/50 group border border-rose-100/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
            <Ruler className="w-5 h-5 text-lavender-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-gray-800">{formatDate(log.date)}</p>
            {parts.length > 0 ? (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{parts.join(" · ")}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">No measurements recorded</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="p-2 rounded-lg text-lavender-500 hover:bg-lavender-100 transition-colors touch-manipulation"
            aria-label="Edit measurement entry"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving}
            className="p-2 rounded-lg text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-colors disabled:opacity-50 touch-manipulation"
            aria-label="Delete measurement entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function mergeMeasurementsByDate(
  measurements: MeasurementLog[]
): MeasurementLog[] {
  return [...measurements]
    .sort((a, b) => b.date.localeCompare(a.date))
    .reduce<MeasurementLog[]>((acc, entry) => {
      const idx = acc.findIndex((m) => m.date === entry.date);
      if (idx >= 0) {
        acc[idx] = mergeMeasurementLog(acc[idx], entry);
      } else {
        acc.push({ ...entry });
      }
      return acc;
    }, []);
}

export function measurementChartData(
  measurements: MeasurementLog[],
  key: "leftArm" | "rightArm" | "waist" | "hips"
) {
  const mergedByDate = mergeMeasurementsByDate(measurements).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return mergedByDate
    .map((m) => {
      const raw = m[key];
      if (raw == null) return null;
      const value = typeof raw === "number" ? raw : parseFloat(String(raw));
      if (!Number.isFinite(value)) return null;
      return { date: m.date, value };
    })
    .filter((entry): entry is { date: string; value: number } => entry !== null)
    .slice(-14)
    .map((entry) => ({
      date: formatDate(entry.date, "MMM d"),
      value: entry.value,
    }));
}
