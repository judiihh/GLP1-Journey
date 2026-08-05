"use client";

import { useState } from "react";
import { useApp } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { MEDICATIONS, DAYS_OF_WEEK, DEFAULT_PROFILE } from "@/lib/constants";
import type { GLP1Medication } from "@/lib/types";
import { HeartPulse, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { ui } from "@/lib/ui-classes";

export function Onboarding() {
  const { setProfile } = useApp();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [medication, setMedication] = useState<GLP1Medication>("ozempic");
  const [dosage, setDosage] = useState("0.25");
  const [injectionDay, setInjectionDay] = useState("0");
  const [injectionTime, setInjectionTime] = useState("09:00");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [goalWeight, setGoalWeight] = useState("");
  const [calorieGoal, setCalorieGoal] = useState("1500");
  const [proteinGoal, setProteinGoal] = useState("100");

  const med = MEDICATIONS.find((m) => m.id === medication)!;

  const handleComplete = async () => {
    await setProfile({
      id: user?.id ?? crypto.randomUUID(),
      name: name || "Friend",
      medication,
      currentDosage: parseFloat(dosage),
      dosageUnit: med.defaultUnit,
      injectionDay: parseInt(injectionDay),
      injectionTime,
      startDate,
      goalWeight: goalWeight ? parseFloat(goalWeight) : undefined,
      goalWeightUnit: "lbs",
      calorieGoal: parseInt(calorieGoal),
      proteinGoal: parseInt(proteinGoal),
      fiberGoal: DEFAULT_PROFILE.fiberGoal,
      waterGoal: DEFAULT_PROFILE.waterGoal,
      waterUnit: DEFAULT_PROFILE.waterUnit,
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    });
  };

  const steps = [
    // Welcome
    <div key="welcome" className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-lavender-200 via-rose-200 to-turquoise-200 flex items-center justify-center">
        <HeartPulse className="w-10 h-10 text-white" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800">
          Welcome to your GLP-1 Journey
        </h2>
        <p className="text-gray-500 mt-3 max-w-md mx-auto leading-relaxed">
          A calm, supportive space to track your medication, nutrition, progress,
          and wellbeing — all in one place.
        </p>
      </div>
      <Button size="lg" onClick={() => setStep(1)} className="w-full max-w-xs mx-auto">
        {`Let's get started`} <ChevronRight className="w-4 h-4" />
      </Button>
    </div>,

    // Name
    <div key="name" className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-gray-800">
          What should we call you?
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          This helps personalize your experience.
        </p>
      </div>
      <Input
        label="Your name"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
        <Button onClick={() => setStep(2)} className="flex-1">
          Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>,

    // Medication
    <div key="med" className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-gray-800">
          Which medication are you taking?
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Select your current GLP-1 medication.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {MEDICATIONS.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMedication(m.id);
              setDosage(String(m.commonDosages[0]));
            }}
            className={cn(
              "p-3 rounded-xl border-2 text-left transition-all",
              medication === m.id ? ui.selectableActive : ui.selectableIdle
            )}
          >
            <p className="font-semibold text-sm text-gray-800">{m.brand}</p>
            <p className="text-xs text-gray-500">{m.frequency}</p>
          </button>
        ))}
      </div>
      <Select
        label="Current dosage"
        value={dosage}
        onChange={(e) => setDosage(e.target.value)}
        options={med.commonDosages.map((d) => ({
          value: String(d),
          label: `${d} ${med.defaultUnit}`,
        }))}
      />
      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
        <Button onClick={() => setStep(3)} className="flex-1">
          Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>,

    // Schedule
    <div key="schedule" className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-gray-800">
          Your injection schedule
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {`We'll remind you before your next dose.`}
        </p>
      </div>
      <Input
        label="Treatment start date"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <Select
        label="Injection day"
        value={injectionDay}
        onChange={(e) => setInjectionDay(e.target.value)}
        options={DAYS_OF_WEEK.map((d, i) => ({ value: String(i), label: d }))}
      />
      <Input
        label="Preferred injection time"
        type="time"
        value={injectionTime}
        onChange={(e) => setInjectionTime(e.target.value)}
      />
      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
        <Button onClick={() => setStep(4)} className="flex-1">
          Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>,

    // Goals
    <div key="goals" className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-gray-800">
          Set your wellness goals
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          These help us personalize your nutrition and progress tracking.
        </p>
      </div>
      <Input
        label="Goal weight (optional)"
        type="number"
        placeholder="e.g. 160"
        value={goalWeight}
        onChange={(e) => setGoalWeight(e.target.value)}
      />
      <Input
        label="Daily calorie goal"
        type="number"
        value={calorieGoal}
        onChange={(e) => setCalorieGoal(e.target.value)}
      />
      <Input
        label="Daily protein goal (g)"
        type="number"
        value={proteinGoal}
        onChange={(e) => setProteinGoal(e.target.value)}
      />
      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
        <Button onClick={handleComplete} className="flex-1">
          <Sparkles className="w-4 h-4" /> Start my journey
        </Button>
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-cream-50 via-lavender-50/30 to-rose-50/30">
      <Card className="w-full max-w-lg">
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-lavender-400" : "bg-lavender-100"
              }`}
            />
          ))}
        </div>
        {steps[step]}
      </Card>
    </div>
  );
}
