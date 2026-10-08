"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { InjectionMedicationDosesEditor } from "@/components/injections/InjectionMedicationDosesEditor";
import {
  buildInjectionLogFromDoses,
  formatDate,
  formatInjectionDosesSummary,
  formatTimeDisplay,
  getInjectionDoses,
  getSiteLabel,
  todayISO,
  validateLogDate,
} from "@/lib/utils";
import { INJECTION_SITES } from "@/lib/constants";
import type { InjectionLog, InjectionMedicationDose, UserProfile } from "@/lib/types";
import { ui } from "@/lib/ui-classes";
import { cn } from "@/lib/cn";
import { Syringe, MapPin, Pencil, Trash2, Check, X } from "lucide-react";

interface InjectionHistoryItemProps {
  injection: InjectionLog;
  profile: UserProfile;
  onUpdate: (injection: InjectionLog) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSaving: boolean;
}

export function InjectionHistoryItem({
  injection,
  profile,
  onUpdate,
  onDelete,
  isSaving,
}: InjectionHistoryItemProps) {
  const [editing, setEditing] = useState(false);
  const [medicationDoses, setMedicationDoses] = useState<InjectionMedicationDose[]>(
    getInjectionDoses(injection)
  );
  const [date, setDate] = useState(injection.date);
  const [time, setTime] = useState(injection.time);
  const [site, setSite] = useState(injection.site);
  const [notes, setNotes] = useState(injection.notes ?? "");

  const resetForm = () => {
    setMedicationDoses(getInjectionDoses(injection));
    setDate(injection.date);
    setTime(injection.time);
    setSite(injection.site);
    setNotes(injection.notes ?? "");
  };

  const handleSave = async () => {
    if (validateLogDate(date)) return;
    await onUpdate(
      buildInjectionLogFromDoses(
        {
          ...injection,
          date,
          time,
          site,
          notes: notes || undefined,
          dosageChanged: injection.dosageChanged,
          previousDosage: injection.previousDosage,
        },
        medicationDoses
      )
    );
    setEditing(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Delete this injection from ${formatDate(injection.date)}?`
      )
    ) {
      return;
    }
    await onDelete(injection.id);
  };

  const handleCancel = () => {
    resetForm();
    setEditing(false);
  };

  const dosesSummary = formatInjectionDosesSummary(getInjectionDoses(injection));

  if (editing) {
    return (
      <div className="p-4 rounded-xl bg-white border-2 border-lavender-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-800">Edit injection</p>
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cancel edit"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <InjectionMedicationDosesEditor
          doses={medicationDoses}
          onChange={setMedicationDoses}
          compact
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date"
            type="date"
            value={date}
            max={todayISO()}
            error={validateLogDate(date) ?? undefined}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Injection site
          </label>
          <div className="grid grid-cols-2 gap-2">
            {INJECTION_SITES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSite(s.id)}
                className={cn(
                  "p-2 rounded-xl border-2 text-xs transition-all",
                  site === s.id ? ui.selectableActive : ui.selectableIdle
                )}
              >
                <MapPin className="w-3 h-3 inline mr-1" />
                {s.shortLabel}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label="Notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

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

  return (
    <div className="p-3 rounded-xl bg-gradient-to-r from-lavender-50/60 to-rose-50/50 group border border-rose-100/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
            <Syringe className="w-5 h-5 text-lavender-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-gray-800 break-words leading-snug">
              {dosesSummary}
              {injection.dosageChanged && (
                <span className="ml-2 text-xs bg-rose-200/80 text-rose-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Dosage change
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 break-words mt-0.5">
              {formatDate(injection.date)} at {formatTimeDisplay(injection.time)} ·{" "}
              {getSiteLabel(injection.site)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="p-2 rounded-lg text-lavender-500 hover:bg-lavender-100 transition-colors touch-manipulation"
            aria-label="Edit injection"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving}
            className="p-2 rounded-lg text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-colors disabled:opacity-50 touch-manipulation"
            aria-label="Delete injection"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {injection.notes && (
        <p className="text-xs text-gray-400 mt-2 ml-[52px] break-words whitespace-pre-wrap leading-relaxed">
          {injection.notes}
        </p>
      )}
    </div>
  );
}
