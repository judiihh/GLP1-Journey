"use client";

import { formatDate } from "@/lib/utils";
import type { MeasurementLog } from "@/lib/types";
import { Ruler } from "lucide-react";

function formatParts(log: MeasurementLog): string[] {
  const parts: string[] = [];
  if (log.waist != null) parts.push(`Waist ${log.waist}"`);
  if (log.hips != null) parts.push(`Hips ${log.hips}"`);
  if (log.leftArm != null) parts.push(`Left arm ${log.leftArm}"`);
  if (log.rightArm != null) parts.push(`Right arm ${log.rightArm}"`);
  return parts;
}

export function MeasurementHistoryItem({ log }: { log: MeasurementLog }) {
  const parts = formatParts(log);

  return (
    <div className="p-3 rounded-xl bg-gradient-to-r from-lavender-50/60 to-rose-50/50 border border-rose-100/30">
      <div className="flex items-start gap-3">
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
    </div>
  );
}

export function measurementChartData(
  measurements: MeasurementLog[],
  key: "leftArm" | "rightArm" | "waist" | "hips"
) {
  return [...measurements]
    .filter((m) => m[key] != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map((m) => ({
      date: formatDate(m.date, "MMM d"),
      value: m[key]!,
    }));
}
