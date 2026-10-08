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
import {
  isReminderSoundEnabled,
  playReminderChime,
  setReminderSoundEnabled,
  unlockReminderAudio,
} from "@/lib/reminder-sound";
import { DIETARY_EXCLUSION_OPTIONS } from "@/lib/dietary-preferences";
import { InjectionMedicationDosesEditor } from "@/components/injections/InjectionMedicationDosesEditor";
import type { InjectionMedicationDose } from "@/lib/types";
import {
  applyProfileInjectionDoses,
  defaultNextInjectionDate,
  getProfileInjectionDoses,
} from "@/lib/utils";
import { getDay, parseISO } from "date-fns";
import { Bell, Trash2, Save, LogOut, Database } from "lucide-react";

export default function SettingsPage() {
  const { data, setProfile, setReminders, clearAllData, usingSupabase } = useApp();
  const { signOut, user } = useAuth();
  const { profile, reminders } = data;

  const [name, setName] = useState(profile?.name ?? "");
  const [injectionDoses, setInjectionDoses] = useState<InjectionMedicationDose[]>(
    profile ? getProfileInjectionDoses(profile) : []
  );
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
  const [excludeShellfish, setExcludeShellfish] = useState(
    profile?.excludeShellfish ?? true
  );
  const [excludePork, setExcludePork] = useState(profile?.excludePork ?? true);
  const [excludeDuck, setExcludeDuck] = useState(profile?.excludeDuck ?? true);
  const [reminderEnabled, setReminderEnabled] = useState(reminders.enabled);
  const [reminderDays, setReminderDays] = useState(
    String(reminders.daysBefore)
  );
  const [reminderSound, setReminderSound] = useState(isReminderSoundEnabled);
  const [saved, setSaved] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  if (!profile) return null;

  const handleSave = async () => {
    await setProfile(
      applyProfileInjectionDoses(
        {
          ...profile,
          name,
          injectionDay: getDay(parseISO(nextInjectionDate)),
          nextInjectionDate,
          injectionTime,
          calorieGoal: parseInt(calorieGoal),
          proteinGoal: parseInt(proteinGoal),
          fiberGoal: parseInt(fiberGoal),
          waterGoal: parseInt(waterGoal),
          goalWeight: goalWeight ? parseFloat(goalWeight) : undefined,
          excludeShellfish,
          excludePork,
          excludeDuck,
        },
        injectionDoses
      )
    );
    await setReminders({
      enabled: reminderEnabled,
      daysBefore: parseInt(reminderDays),
      time: injectionTime,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEnableNotifications = async () => {
    await unlockReminderAudio();
    const perm = await requestNotificationPermission();
    if (perm === "granted") {
      setReminderEnabled(true);
      if (reminderSound) {
        await playReminderChime();
      }
    }
  };

  const handleTestReminderSound = async () => {
    await unlockReminderAudio();
    await playReminderChime();
  };

  const handleReminderSoundToggle = (enabled: boolean) => {
    setReminderSound(enabled);
    setReminderSoundEnabled(enabled);
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
            <InjectionMedicationDosesEditor
              doses={injectionDoses}
              onChange={setInjectionDoses}
              compact
            />
            <p className="text-xs text-gray-500 -mt-1">
              The first medication sets your injection schedule and reminders.
              Add more if your doctor combines medications in one shot.
            </p>
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

        {/* Meal preferences */}
        <Card>
          <CardHeader
            title="Meal preferences"
            subtitle="Ingredients to avoid in AI-generated meal plans"
          />
          <div className="space-y-3">
            {DIETARY_EXCLUSION_OPTIONS.map((option) => {
              const checked =
                option.key === "excludeShellfish"
                  ? excludeShellfish
                  : option.key === "excludePork"
                    ? excludePork
                    : excludeDuck;
              const setChecked =
                option.key === "excludeShellfish"
                  ? setExcludeShellfish
                  : option.key === "excludePork"
                    ? setExcludePork
                    : setExcludeDuck;

              return (
                <label
                  key={option.key}
                  className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100/80 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="rounded border-lavender-300 w-4 h-4 mt-0.5 shrink-0"
                  />
                  <span>
                    <span className="text-sm font-medium text-gray-800 block">
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-500">{option.description}</span>
                  </span>
                </label>
              );
            })}
            <p className="text-xs text-gray-500 pt-1">
              Quick plans use your curated favorites and are not affected by these
              toggles.
            </p>
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
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={reminderSound}
                onChange={(e) => handleReminderSoundToggle(e.target.checked)}
                className="rounded border-lavender-300 w-4 h-4"
              />
              <span className="text-sm text-gray-700">Play bell chime with reminders</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleEnableNotifications} className="w-full sm:flex-1">
                <Bell className="w-4 h-4" /> Enable browser notifications
              </Button>
              <Button
                variant="outline"
                onClick={handleTestReminderSound}
                className="w-full sm:flex-1"
                disabled={!reminderSound}
              >
                Test chime
              </Button>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              On mobile, tap <strong>Test chime</strong> once so your browser allows sound.
              The chime plays when the app is open and a reminder is due.
            </p>
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
