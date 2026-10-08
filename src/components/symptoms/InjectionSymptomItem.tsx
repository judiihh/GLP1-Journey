"use client";

import { useState } from "react";
import {
  formatDate,
  formatInjectionDosesSummary,
  getInjectionDoses,
  getSiteLabel,
} from "@/lib/utils";
import { SEVERITY_LABELS } from "@/lib/constants";
import type { InjectionLog, SideEffectLog } from "@/lib/types";
import { SymptomLogForm, symptomSummaryTags } from "./SymptomLogForm";
import { Syringe, ChevronDown, HeartPulse, Pencil } from "lucide-react";
import { cn } from "@/lib/cn";

interface InjectionSymptomItemProps {
  injection: InjectionLog;
  sideEffect?: SideEffectLog;
  onSave: (log: SideEffectLog) => Promise<void>;
  defaultOpen?: boolean;
}

export function InjectionSymptomItem({
  injection,
  sideEffect,
  onSave,
  defaultOpen = false,
}: InjectionSymptomItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const tags = symptomSummaryTags(sideEffect);
  const hasLog = tags.length > 0 || Boolean(sideEffect?.notes);

  return (
    <div className="rounded-xl border border-lavender-100/80 overflow-hidden bg-white/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-lavender-50/40 transition-colors touch-manipulation"
      >
        <div className="w-9 h-9 rounded-xl bg-lavender-100 flex items-center justify-center shrink-0">
          <Syringe className="w-4 h-4 text-lavender-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-800">
              <span className="sm:hidden">
                {formatDate(injection.date, "EEE, MMM d")}
              </span>
              <span className="hidden sm:inline">
                {formatDate(injection.date, "EEEE, MMM d")}
              </span>
            </span>
            {hasLog ? (
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-turquoise-100 text-turquoise-700">
                Logged
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-rose-50 text-rose-500">
                No symptoms yet
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 break-words leading-relaxed">
            {formatInjectionDosesSummary(getInjectionDoses(injection))} ·{" "}
            {getSiteLabel(injection.site)}
          </p>
          {hasLog && !open && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t) => (
                <span
                  key={t.type}
                  className={cn(
                    "text-[11px] px-2 py-0.5 rounded-full",
                    t.severity >= 4
                      ? "bg-rose-100 text-rose-700"
                      : t.severity >= 2
                        ? "bg-lavender-100 text-lavender-700"
                        : "bg-sage-100 text-sage-700"
                  )}
                >
                  {t.label}: {SEVERITY_LABELS[t.severity]}
                </span>
              ))}
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-lavender-400 shrink-0 transition-transform mt-0.5",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-lavender-100/60 bg-lavender-50/20">
          <p className="text-xs text-gray-500 flex items-center gap-1.5 py-3">
            <Pencil className="w-3.5 h-3.5" />
            Log or update how you felt on this injection day
          </p>
          <SymptomLogForm
            date={injection.date}
            existing={sideEffect}
            onSave={onSave}
            submitLabel={hasLog ? "Update symptoms" : "Log symptoms for this day"}
            compact
          />
        </div>
      )}
    </div>
  );
}

export function OtherSymptomDayItem({
  entry,
  onEdit,
}: {
  entry: SideEffectLog;
  onEdit: () => void;
}) {
  const tags = symptomSummaryTags(entry);

  return (
    <button
      type="button"
      onClick={onEdit}
      className="w-full text-left p-4 rounded-xl bg-lavender-50/50 hover:bg-lavender-50 transition-colors touch-manipulation"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm text-gray-800">
          <span className="sm:hidden">
            {formatDate(entry.date, "EEE, MMM d")}
          </span>
          <span className="hidden sm:inline">
            {formatDate(entry.date, "EEEE, MMM d")}
          </span>
        </span>
        <HeartPulse className="w-4 h-4 text-lavender-400" />
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span
            key={t.type}
            className={`text-xs px-2.5 py-1 rounded-full ${
              t.severity >= 4
                ? "bg-rose-100 text-rose-700"
                : t.severity >= 2
                  ? "bg-lavender-100 text-lavender-700"
                  : "bg-sage-100 text-sage-700"
            }`}
          >
            {t.label}: {SEVERITY_LABELS[t.severity]}
          </span>
        ))}
      </div>
      {entry.notes && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{entry.notes}</p>
      )}
    </button>
  );
}
