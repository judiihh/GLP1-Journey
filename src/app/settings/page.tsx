"use client";

import { useState } from "react";
import { useApp } from "@/hooks/useAppData";
import { PageHeader } from "@/components/layout/Navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { clearAllData } from "@/lib/storage";
import { requestNotificationPermission } from "@/hooks/useReminders";
import { MEDICATIONS, DAYS_OF_WEEK } from "@/lib/constants";
import type { GLP1Medication } from "@/lib/types";
import { Bell, User, Target, Trash2, Save } from "lucide-react";

export default function SettingsPage() {
  const { data, setProfile, setReminders } = useApp();
  const { profile, reminders } = data;

  const [name, setName] = useState(profile?.name ?? "");
  const [medication, setMedication] = useState<GLP1Medication>(
    profile?.medication ?? "ozempic"
  );
  const [dosage, setDosage] = useState(String(profile?.currentDosage ?? 0.25));
  const [injectionDay, setInjectionDay] = useState(
    String(profile?.injectionDay ?? 0)
  );
  const [injectionTime, setInjectionTime] = useState(
    profile?.injectionTime ?? "09:00"
  );
  const [calorieGoal, setCalorieGoal] = useState(
    String(profile?.calorieGoal ?? 1500)
  );
  const [proteinGoal, setProteinGoal] = useState(
    String(profile?.proteinGoal ?? 100)
  );
  const [fiberGoal, setFiberGoal] = useState(
    String(profile?.fiberGoal ?? 25)
  );
  const [waterGoal, setWaterGoal] = useState(
    String(profile?.waterGoal ?? 64)
  );
  const [goalWeight, setGoalWeight] = useState(
    String(profile?.goalWeight ?? "")
  );
  const [reminderEnabled, setReminderEnabled] = useState(reminders.enabled);
  const [reminderDays, setReminderDays] = useState(
    String(reminders.daysBefore)
  );
  const [saved, setSaved] = useState(false);

  if (!profile) return null;

  const med = MEDICATIONS.find((m) => m.id === medication)!;

  const handleSave = () => {
    setProfile({
      ...profile,
      name,
      medication,
      currentDosage: parseFloat(dosage),
      dosageUnit: med.defaultUnit,
      injectionDay: parseInt(injectionDay),
      injectionTime,
      calorieGoal: parseInt(calorieGoal),
      proteinGoal: parseInt(proteinGoal),
      fiberGoal: parseInt(fiberGoal),
      waterGoal: parseInt(waterGoal),
      goalWeight: goalWeight ? parseFloat(goalWeight) : undefined,
    });
    setReminders({
      enabled: reminderEnabled,
      daysBefore: parseInt(reminderDays),
      time: injectionTime,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    if (perm === "granted") {
      setReminderEnabled(true);
    }
  };

  const handleReset = () => {
    if (
      confirm(
        "Are you sure? This will delete all your data and restart onboarding."
      )
    ) {
      clearAllData();
      window.location.reload();
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Customize your profile, goals, and reminders"
        action={
          <Button onClick={handleSave}>
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save changes"}
          </Button>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card>
          <CardHeader title="Profile" subtitle="Your personal information" />
          <div className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Select
              label="Medication"
              value={medication}
              onChange={(e) => {
                setMedication(e.target.value as GLP1Medication);
                const m = MEDICATIONS.find((med) => med.id === e.target.value)!;
                setDosage(String(m.commonDosages[0]));
              }}
              options={MEDICATIONS.map((m) => ({
                value: m.id,
                label: m.brand,
              }))}
            />
            <Select
              label="Current dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              options={med.commonDosages.map((d) => ({
                value: String(d),
                label: `${d} ${med.defaultUnit}`,
              }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Injection day"
                value={injectionDay}
                onChange={(e) => setInjectionDay(e.target.value)}
                options={DAYS_OF_WEEK.map((d, i) => ({
                  value: String(i),
                  label: d,
                }))}
              />
              <Input
                label="Injection time"
                type="time"
                value={injectionTime}
                onChange={(e) => setInjectionTime(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader title="Goals" subtitle="Nutrition and weight targets" />
          <div className="space-y-4">
            <Input
              label="Goal weight (lbs)"
              type="number"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              placeholder="Optional"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Calorie goal"
                type="number"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
              />
              <Input
                label="Protein goal (g)"
                type="number"
                value={proteinGoal}
                onChange={(e) => setProteinGoal(e.target.value)}
              />
              <Input
                label="Fiber goal (g)"
                type="number"
                value={fiberGoal}
                onChange={(e) => setFiberGoal(e.target.value)}
              />
              <Input
                label="Water goal (oz)"
                type="number"
                value={waterGoal}
                onChange={(e) => setWaterGoal(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Reminders */}
        <Card>
          <CardHeader
            title="Reminders"
            subtitle="Get notified before your next injection"
          />
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="rounded border-lavender-300 w-4 h-4"
              />
              <span className="text-sm text-gray-700">Enable injection reminders</span>
            </label>
            <Select
              label="Remind me"
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
              options={[
                { value: "0", label: "On injection day" },
                { value: "1", label: "1 day before" },
                { value: "2", label: "2 days before" },
              ]}
            />
            <Button variant="outline" onClick={handleEnableNotifications} className="w-full">
              <Bell className="w-4 h-4" /> Enable browser notifications
            </Button>
          </div>
        </Card>

        {/* Data management */}
        <Card>
          <CardHeader title="Data" subtitle="Manage your stored information" />
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-lavender-50 text-sm text-gray-600">
              <p>
                All data is stored locally on your device. Nothing is sent to a
                server — your health information stays private.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={handleReset}
              className="w-full text-rose-600"
            >
              <Trash2 className="w-4 h-4" /> Reset all data
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
