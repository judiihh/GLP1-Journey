"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useApp } from "@/hooks/useAppData";
import { PageHeader } from "@/components/layout/Navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { BodyMap } from "@/components/charts/Charts";
import {
  formatDate,
  getDaysUntilInjection,
  getSiteLabel,
  getSiteRotationStatus,
  suggestNextInjectionSite,
} from "@/lib/utils";
import { INJECTION_SITES, MEDICATIONS } from "@/lib/constants";
import type { InjectionSite } from "@/lib/types";
import { todayISO } from "@/lib/utils";
import { Syringe, MapPin, History, CheckCircle2 } from "lucide-react";

export default function InjectionsPage() {
  const { data, logInjection } = useApp();
  const { profile, injections } = data;
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(
    new Date().toTimeString().slice(0, 5)
  );
  const [dosage, setDosage] = useState(String(profile?.currentDosage ?? 0.25));
  const [site, setSite] = useState<InjectionSite>(
    suggestNextInjectionSite(injections)
  );
  const [notes, setNotes] = useState("");
  const [dosageChanged, setDosageChanged] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!profile) return null;

  const med = MEDICATIONS.find((m) => m.id === profile.medication)!;
  const suggestedSite = suggestNextInjectionSite(injections);
  const siteStatus = getSiteRotationStatus(injections);
  const daysUntil = getDaysUntilInjection(profile, injections);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newDosage = parseFloat(dosage);
    const changed = newDosage !== profile.currentDosage;

    await logInjection({
      id: uuidv4(),
      date,
      time,
      medication: profile.medication,
      dosage: newDosage,
      dosageUnit: profile.dosageUnit,
      site,
      notes: notes || undefined,
      dosageChanged: changed || dosageChanged,
      previousDosage: changed ? profile.currentDosage : undefined,
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowForm(false);
      setNotes("");
    }, 2000);
  };

  return (
    <div>
      <PageHeader
        title="Injections"
        subtitle="Log doses and rotate injection sites"
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            <Syringe className="w-4 h-4" />
            {showForm ? "Cancel" : "Log injection"}
          </Button>
        }
      />

      {/* Status cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-xs text-gray-500">Next injection</p>
          <p className="font-display text-lg font-bold text-gray-800 mt-1">
            {daysUntil === 0
              ? "Today"
              : daysUntil !== null
                ? `${daysUntil} day${daysUntil > 1 ? "s" : ""}`
                : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Current dosage</p>
          <p className="font-display text-lg font-bold text-gray-800 mt-1">
            {profile.currentDosage} {profile.dosageUnit}
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
        {/* Site rotation map */}
        <Card>
          <CardHeader
            title="Injection site rotation"
            subtitle={`Suggested next: ${getSiteLabel(suggestedSite)}`}
          />
          <BodyMap sites={siteStatus} suggestedSite={suggestedSite} />
        </Card>

        {/* Log form */}
        {showForm ? (
          <Card>
            <CardHeader title="Log new injection" />
            {saved ? (
              <div className="flex flex-col items-center py-8 text-turquoise-500">
                <CheckCircle2 className="w-12 h-12 mb-3" />
                <p className="font-medium">Injection logged successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Date"
                    type="date"
                    value={date}
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
                  options={med.commonDosages.map((d) => ({
                    value: String(d),
                    label: `${d} ${med.defaultUnit}`,
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
                        className={`p-2.5 rounded-xl border-2 text-sm transition-all ${
                          site === s.id
                            ? "border-lavender-400 bg-lavender-50 font-medium"
                            : s.id === suggestedSite
                              ? "border-turquoise-200 bg-turquoise-50"
                              : "border-gray-100 hover:border-lavender-200"
                        }`}
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
                    checked={dosageChanged}
                    onChange={(e) => setDosageChanged(e.target.checked)}
                    className="rounded border-lavender-300"
                  />
                  Mark as dosage change
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
            )}
          </Card>
        ) : (
          <Card>
            <CardHeader title="Quick log" subtitle="Tap to log with suggested site" />
            <button
              onClick={() => {
                setSite(suggestedSite);
                setShowForm(true);
              }}
              className="w-full p-6 rounded-2xl border-2 border-dashed border-lavender-200 hover:border-lavender-400 hover:bg-lavender-50/50 transition-all text-center"
            >
              <Syringe className="w-8 h-8 mx-auto text-lavender-400 mb-2" />
              <p className="font-medium text-gray-700">Log today's injection</p>
              <p className="text-sm text-gray-500 mt-1">
                Suggested site: {getSiteLabel(suggestedSite)}
              </p>
            </button>
          </Card>
        )}
      </div>

      {/* History */}
      <Card>
        <CardHeader title="Injection history" subtitle="Your recent doses" />
        {injections.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No injections logged yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {injections.slice(0, 10).map((inj) => (
              <div
                key={inj.id}
                className="flex items-center justify-between p-3 rounded-xl bg-lavender-50/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                    <Syringe className="w-5 h-5 text-lavender-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      {inj.dosage} {inj.dosageUnit}
                      {inj.dosageChanged && (
                        <span className="ml-2 text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                          Dosage change
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(inj.date)} at {inj.time} · {getSiteLabel(inj.site)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
