"use client";

import { useState } from "react";
import { useApp } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/Navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { testConnection } from "@/lib/supabase/data";
import { requestNotificationPermission } from "@/hooks/useReminders";
import { MEDICATIONS } from "@/lib/constants";
import type { GLP1Medication } from "@/lib/types";
import { defaultNextInjectionDate } from "@/lib/utils";
import { getDay, parseISO } from "date-fns";
import { Bell, Trash2, Save, LogOut, Database } from "lucide-react";

export default function SettingsPage() {
  const { data, setProfile, setReminders, clearAllData, usingSupabase } = useApp();
  const { signOut, user } = useAuth();
  const { profile, reminders } = data;

  const [name, setName] = useState(profile?.name ?? "");
  const [medication, setMedication] = useState<GLP1Medication>(
    profile?.medication ?? "ozempic"
  );
  const [dosage, setDosage] = useState(String(profile?.currentDosage ?? 0.25));
  const [nextInjectionDate, setNextInjectionDate] = useState(
    profile?.nextInjectionDate ?? defaultNextInjectionDate()
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
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  if (!profile) return null;

  const med = MEDICATIONS.find((m) => m.id === medication)!;

  const handleSave = async () => {
    await setProfile({
      ...profile,
      name,
      medication,
      currentDosage: parseFloat(dosage),
      dosageUnit: med.defaultUnit,
      injectionDay: getDay(parseISO(nextInjectionDate)),
      nextInjectionDate,
      injectionTime,
      calorieGoal: parseInt(calorieGoal),
      proteinGoal: parseInt(proteinGoal),
      fiberGoal: parseInt(fiberGoal),
      waterGoal: parseInt(waterGoal),
      goalWeight: goalWeight ? parseFloat(goalWeight) : undefined,
    });
    await setReminders({
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

  const handleReset = async () => {
    if (
      confirm(
        "Are you sure? This will delete all your tracking data and restart onboarding."
      )
    ) {
      await clearAllData();
      window.location.reload();
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const result = await testConnection(createClient());
      setConnectionStatus(result.message);
    } catch (err) {
      setConnectionStatus(
        err instanceof Error ? err.message : "Connection test failed"
      );
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Next injection date"
                type="date"
                value={nextInjectionDate}
                onChange={(e) => setNextInjectionDate(e.target.value)}
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
          <CardHeader title="Account & data" subtitle="Cloud sync and account actions" />
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-lavender-50 text-sm text-gray-600">
              {usingSupabase ? (
                <>
                  <p>Signed in as <strong>{user?.email}</strong></p>
                  <p className="mt-2">
                    Your data is stored securely in Supabase. Row Level Security
                    ensures only you can access your records.
                  </p>
                </>
              ) : (
                <p>
                  Supabase is not configured. Data is stored locally in your browser
                  until you add your environment variables.
                </p>
              )}
            </div>
            {usingSupabase && (
              <Button
                variant="outline"
                onClick={handleTestConnection}
                loading={testingConnection}
                className="w-full"
              >
                <Database className="w-4 h-4" /> Test Supabase connection
              </Button>
            )}
            {connectionStatus && (
              <p className="text-sm text-gray-600 bg-white/60 p-3 rounded-xl">
                {connectionStatus}
              </p>
            )}
            <Button
              variant="secondary"
              onClick={handleReset}
              className="w-full text-rose-600"
            >
              <Trash2 className="w-4 h-4" /> Reset all tracking data
            </Button>
            {usingSupabase && (
              <Button variant="ghost" onClick={handleSignOut} className="w-full">
                <LogOut className="w-4 h-4" /> Sign out
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
