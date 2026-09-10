"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { getDay, parseISO } from "date-fns";
import { useApp } from "@/hooks/useAppData";
import { PageHeader } from "@/components/layout/Navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { BodyMap } from "@/components/charts/Charts";
import { NextInjectionConfirm } from "@/components/injections/NextInjectionConfirm";
import {
  formatDate,
  formatInjectionCountdown,
  getDaysUntilInjection,
  getMedicationLabel,
  getNextInjectionLabel,
  getSiteLabel,
  getSiteRotationStatus,
  getSuggestedNextInjectionDate,
  hasCompletedScheduledInjection,
  suggestNextInjectionSite,
  todayISO,
  validateLogDate,
} from "@/lib/utils";
import { INJECTION_SITES, MEDICATIONS } from "@/lib/constants";
import type { GLP1Medication, InjectionSite } from "@/lib/types";
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
  const [medication, setMedication] = useState<GLP1Medication>(
    profile?.medication ?? "ozempic"
  );
  const [dosage, setDosage] = useState(String(profile?.currentDosage ?? 0.25));
  const [site, setSite] = useState<InjectionSite>(
    suggestNextInjectionSite(injections)
  );
  const [notes, setNotes] = useState("");
  const [dosageChanged, setDosageChanged] = useState(false);
  const [nextConfirm, setNextConfirm] = useState<{
    suggestedDate: string;
    suggestedTime: string;
  } | null>(null);
  const today = todayISO();
  const dateError = validateLogDate(date);

  if (!profile) return null;

  const selectedMed = MEDICATIONS.find((m) => m.id === medication)!;
  const suggestedSite = suggestNextInjectionSite(injections);
  const siteStatus = getSiteRotationStatus(injections);
  const daysUntil = getDaysUntilInjection(profile, injections);
  const nextInjectionLabel = getNextInjectionLabel(profile, injections);
  const doseComplete = hasCompletedScheduledInjection(profile, injections);

  const openForm = () => {
    setMedication(profile.medication);
    setDosage(String(profile.currentDosage));
    setSite(suggestedSite);
    setDate(todayISO());
    setTime(profile.injectionTime || new Date().toTimeString().slice(0, 5));
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

  const handleMedicationChange = (id: GLP1Medication) => {
    setMedication(id);
    const med = MEDICATIONS.find((m) => m.id === id)!;
    setDosage(String(med.commonDosages[0]));
    setDosageChanged(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateLogDate(date)) return;
    const newDosage = parseFloat(dosage);
    const isCurrentProfileMed = medication === profile.medication;
    const changed =
      isCurrentProfileMed && newDosage !== profile.currentDosage;

    await logInjection({
      id: uuidv4(),
      date,
      time,
      medication,
      dosage: newDosage,
      dosageUnit: selectedMed.defaultUnit,
      site,
      notes: notes || undefined,
      dosageChanged: (changed || dosageChanged) && isCurrentProfileMed,
      previousDosage:
        changed && isCurrentProfileMed ? profile.currentDosage : undefined,
    });

    const suggestedDate = getSuggestedNextInjectionDate(
      profile,
      date,
      medication
    );

    setNextConfirm({
      suggestedDate,
      suggestedTime: time || profile.injectionTime,
    });
    setShowForm(false);
    setNotes("");
    setDosageChanged(false);
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
        <div className="mb-6">
          <NextInjectionConfirm
            medicationLabel={getMedicationLabel(profile.medication)}
            medication={profile.medication}
            suggestedDate={nextConfirm.suggestedDate}
            suggestedTime={nextConfirm.suggestedTime}
            onConfirm={handleConfirmNext}
            isSaving={isSaving}
          />
        </div>
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
              {profile.injectionTime ? ` at ${profile.injectionTime}` : ""}
            </p>
          )}
          {doseComplete && daysUntil !== null && daysUntil > 0 && (
            <p className="text-xs text-turquoise-600 mt-1.5">
              Current dose completed
            </p>
          )}
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Profile medication</p>
          <p className="font-display text-lg font-bold text-gray-800 mt-1">
            {getMedicationLabel(profile.medication)}
          </p>
          <p className="text-xs text-lavender-500 mt-0.5">
            {profile.currentDosage} {profile.dosageUnit} · default for new logs
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
              subtitle="Medication defaults to your profile — change it for past or switched doses"
            />
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication used
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {MEDICATIONS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleMedicationChange(m.id)}
                        className={cn(
                          "p-2.5 rounded-xl border-2 text-left transition-all text-sm",
                          medication === m.id
                            ? ui.selectableActive
                            : ui.selectableIdle
                        )}
                      >
                        <p className="font-semibold text-gray-800 leading-tight">
                          {m.brand}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {m.frequency}
                        </p>
                      </button>
                    ))}
                  </div>
                  {medication !== profile.medication && (
                    <p className="text-xs text-lavender-600 mt-2 bg-lavender-50/80 px-3 py-2 rounded-lg">
                      Logging as {selectedMed.brand} — your profile default remains{" "}
                      {getMedicationLabel(profile.medication)}.
                    </p>
                  )}
                </div>

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
                Default: {getMedicationLabel(profile.medication)} ·{" "}
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
