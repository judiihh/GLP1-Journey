"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { formatDate, getMedicationLabel, getSiteLabel, todayISO, validateLogDate } from "@/lib/utils";
import { INJECTION_SITES, MEDICATIONS } from "@/lib/constants";
import type { GLP1Medication, InjectionLog, InjectionSite, UserProfile } from "@/lib/types";
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
  const [medication, setMedication] = useState(injection.medication);
  const [date, setDate] = useState(injection.date);
  const [time, setTime] = useState(injection.time);
  const [dosage, setDosage] = useState(String(injection.dosage));
  const [site, setSite] = useState(injection.site);
  const [notes, setNotes] = useState(injection.notes ?? "");
  const [dosageChanged, setDosageChanged] = useState(
    injection.dosageChanged ?? false
  );

  const selectedMed = MEDICATIONS.find((m) => m.id === medication)!;

  const resetForm = () => {
    setMedication(injection.medication);
    setDate(injection.date);
    setTime(injection.time);
    setDosage(String(injection.dosage));
    setSite(injection.site);
    setNotes(injection.notes ?? "");
    setDosageChanged(injection.dosageChanged ?? false);
  };

  const handleMedicationChange = (id: GLP1Medication) => {
    setMedication(id);
    const med = MEDICATIONS.find((m) => m.id === id)!;
    if (!med.commonDosages.includes(parseFloat(dosage))) {
      setDosage(String(med.commonDosages[0]));
    }
  };

  const handleSave = async () => {
    if (validateLogDate(date)) return;
    await onUpdate({
      ...injection,
      medication,
      date,
      time,
      dosage: parseFloat(dosage),
      dosageUnit: selectedMed.defaultUnit,
      site,
      notes: notes || undefined,
      dosageChanged:
        medication === profile.medication ? dosageChanged : false,
      previousDosage: injection.previousDosage,
    });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Delete this ${getMedicationLabel(injection.medication)} injection from ${formatDate(injection.date)}?`
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medication used
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
            {MEDICATIONS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleMedicationChange(m.id)}
                className={cn(
                  "p-2 rounded-xl border-2 text-left text-xs transition-all",
                  medication === m.id ? ui.selectableActive : ui.selectableIdle
                )}
              >
                <p className="font-semibold text-gray-800">{m.brand}</p>
              </button>
            ))}
          </div>
        </div>

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

        <Select
          label="Dosage"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          options={selectedMed.commonDosages.map((d) => ({
            value: String(d),
            label: `${d} ${selectedMed.defaultUnit}`,
          }))}
        />

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

        {medication === profile.medication && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={dosageChanged}
              onChange={(e) => setDosageChanged(e.target.checked)}
              className="rounded border-lavender-300"
            />
            Mark as dosage change on profile
          </label>
        )}

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
            <p className="font-medium text-sm text-gray-800 break-words">
              {getMedicationLabel(injection.medication)} · {injection.dosage}{" "}
              {injection.dosageUnit}
              {injection.dosageChanged && (
                <span className="ml-2 text-xs bg-rose-200/80 text-rose-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Dosage change
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 break-words">
              {formatDate(injection.date)} at {injection.time} ·{" "}
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
