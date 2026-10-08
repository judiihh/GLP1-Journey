"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { getDay, parseISO } from "date-fns";
import { useApp } from "@/hooks/useAppData";
import { PageHeader } from "@/components/layout/Navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { BodyMap } from "@/components/charts/Charts";
import { NextInjectionConfirm } from "@/components/injections/NextInjectionConfirm";
import { InjectionMedicationDosesEditor } from "@/components/injections/InjectionMedicationDosesEditor";
import {
  buildInjectionLogFromDoses,
  formatInjectionCountdown,
  formatInjectionDosesSummary,
  formatTimeDisplay,
  getDaysUntilInjection,
  getMedicationLabel,
  getNextInjectionLabel,
  getProfileInjectionDoses,
  getSiteLabel,
  getSiteRotationStatus,
  getSuggestedNextInjectionDate,
  hasCompletedScheduledInjection,
  suggestNextInjectionSite,
  todayISO,
  validateLogDate,
} from "@/lib/utils";
import { INJECTION_SITES } from "@/lib/constants";
import type { InjectionMedicationDose, InjectionSite } from "@/lib/types";
import { ui } from "@/lib/ui-classes";
import { cn } from "@/lib/cn";
import { Syringe, MapPin } from "lucide-react";
import { InjectionHistoryItem } from "@/components/injections/InjectionHistoryItem";

export default function InjectionsPage() {
  const { data, logInjection, updateInjection, deleteInjection, setProfile, isSaving } =
    useApp();
  const { profile, injections } = data;
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [medicationDoses, setMedicationDoses] = useState<InjectionMedicationDose[]>(
    []
  );
  const [site, setSite] = useState<InjectionSite>(
    suggestNextInjectionSite(injections)
  );
  const [notes, setNotes] = useState("");
  const [updateProfileDoses, setUpdateProfileDoses] = useState(false);
  const [nextConfirm, setNextConfirm] = useState<{
    suggestedDate: string;
    suggestedTime: string;
  } | null>(null);
  const today = todayISO();
  const dateError = validateLogDate(date);

  if (!profile) return null;

  const profileDoses = getProfileInjectionDoses(profile);
  const suggestedSite = suggestNextInjectionSite(injections);
  const siteStatus = getSiteRotationStatus(injections);
  const daysUntil = getDaysUntilInjection(profile, injections);
  const nextInjectionLabel = getNextInjectionLabel(profile, injections);
  const doseComplete = hasCompletedScheduledInjection(profile, injections);

  const openForm = () => {
    setMedicationDoses(
      profileDoses.map((d) => ({ ...d }))
    );
    setSite(suggestedSite);
    setDate(todayISO());
    setTime(profile.injectionTime || new Date().toTimeString().slice(0, 5));
    setUpdateProfileDoses(false);
    setNextConfirm(null);
    setShowForm(true);
  };

  const handleConfirmNext = async (nextDate: string, nextTime: string) => {
    await setProfile({
      ...profile,
      nextInjectionDate: nextDate,
      injectionTime: nextTime,
      injectionDay: getDay(parseISO(nextDate)),
    });
    setNextConfirm(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateLogDate(date)) return;

    await logInjection(
      buildInjectionLogFromDoses(
        {
          id: uuidv4(),
          date,
          time,
          site,
          notes: notes || undefined,
          dosageChanged: updateProfileDoses,
        },
        medicationDoses
      )
    );

    const suggestedDate = getSuggestedNextInjectionDate(
      profile,
      date,
      profile.medication
    );

    setNextConfirm({
      suggestedDate,
      suggestedTime: time || profile.injectionTime,
    });
    setShowForm(false);
    setNotes("");
    setUpdateProfileDoses(false);
  };

  return (
    <div>
      <PageHeader
        title="Injections"
        subtitle="Log doses and rotate injection sites"
        action={
          <Button onClick={() => (showForm ? setShowForm(false) : openForm())}>
            <Syringe className="w-4 h-4" />
            {showForm ? "Cancel" : "Log injection"}
          </Button>
        }
      />

      {nextConfirm && (
        <NextInjectionConfirm
          open
          medicationLabel={getMedicationLabel(profile.medication)}
          medication={profile.medication}
          suggestedDate={nextConfirm.suggestedDate}
          suggestedTime={nextConfirm.suggestedTime}
          onConfirm={handleConfirmNext}
          onClose={() => setNextConfirm(null)}
          isSaving={isSaving}
        />
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-xs text-gray-500">Next injection</p>
          <p className="font-display text-lg font-bold text-gray-800 mt-1">
            {formatInjectionCountdown(daysUntil)}
          </p>
          {nextInjectionLabel && (
            <p className="text-xs text-lavender-500 mt-0.5">
              {nextInjectionLabel}
              {profile.injectionTime
                ? ` at ${formatTimeDisplay(profile.injectionTime)}`
                : ""}
            </p>
          )}
          {doseComplete && daysUntil !== null && daysUntil > 0 && (
            <p className="text-xs text-turquoise-600 mt-1.5">
              Current dose completed
            </p>
          )}
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Default injection</p>
          <p className="font-display text-sm font-bold text-gray-800 mt-1 leading-snug">
            {formatInjectionDosesSummary(profileDoses)}
          </p>
          <p className="text-xs text-lavender-500 mt-0.5">
            Used when you log a new injection
          </p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Total logged</p>
          <p className="font-display text-lg font-bold text-gray-800 mt-1">
            {injections.length} injection{injections.length !== 1 ? "s" : ""}
          </p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader
            title="Injection site rotation"
            subtitle={`Suggested next: ${getSiteLabel(suggestedSite)}`}
          />
          <BodyMap sites={siteStatus} suggestedSite={suggestedSite} />
        </Card>

        {showForm ? (
          <Card>
            <CardHeader
              title="Log new injection"
              subtitle="Add each medication and dose in this injection"
            />
            <form onSubmit={handleSubmit} className="space-y-4">
              <InjectionMedicationDosesEditor
                doses={medicationDoses}
                onChange={setMedicationDoses}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Date"
                  type="date"
                  value={date}
                  max={today}
                  error={dateError ?? undefined}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <Input
                  label="Time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
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
                        "p-2.5 rounded-xl border-2 text-sm transition-all",
                        site === s.id
                          ? ui.selectableActive
                          : s.id === suggestedSite
                            ? "border-turquoise-200 bg-turquoise-50"
                            : ui.selectableIdle
                      )}
                    >
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {s.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={updateProfileDoses}
                  onChange={(e) => setUpdateProfileDoses(e.target.checked)}
                  className="rounded border-lavender-300"
                />
                Save these doses as my default for future injections
              </label>
              <Textarea
                label="Notes (optional)"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How are you feeling?"
              />
              <Button type="submit" className="w-full">
                Save injection
              </Button>
            </form>
          </Card>
        ) : (
          <Card>
            <CardHeader title="Quick log" subtitle="Tap to log with suggested site" />
            <button
              onClick={openForm}
              className="w-full p-6 rounded-2xl border-2 border-dashed border-lavender-200 hover:border-lavender-400 hover:bg-lavender-50/50 transition-all text-center"
            >
              <Syringe className="w-8 h-8 mx-auto text-lavender-400 mb-2" />
              <p className="font-medium text-gray-700">{`Log today's injection`}</p>
              <p className="text-sm text-gray-500 mt-1">
                Default: {formatInjectionDosesSummary(profileDoses)} ·{" "}
                {getSiteLabel(suggestedSite)}
              </p>
            </button>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader
          title="Injection history"
          subtitle="Tap edit or delete on any entry"
        />
        {injections.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Syringe className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No injections logged yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {injections.map((inj) => (
              <InjectionHistoryItem
                key={inj.id}
                injection={inj}
                profile={profile}
                onUpdate={updateInjection}
                onDelete={deleteInjection}
                isSaving={isSaving}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
