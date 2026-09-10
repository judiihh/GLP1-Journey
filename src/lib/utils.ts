import {
  addDays,
  differenceInDays,
  format,
  getDay,
  parse,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import type {
  AppData,
  DailyMealPlan,
  GLP1Medication,
  InjectionSite,
  MealPlanItem,
  MeasurementLog,
  PatternInsight,
  UserProfile,
} from "./types";
import { INJECTION_SITES, MEAL_TEMPLATES, MEDICATIONS } from "./constants";
import { mealPlanTotals, scaleMealsToCalorieGoal } from "./meal-plan-shared";

export function formatDate(date: string | Date, fmt = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

/** Display HH:mm storage values as 12-hour time (e.g. "2:20 PM"). */
export function formatTimeDisplay(time: string): string {
  if (!time) return "";
  try {
    return format(parse(time, "HH:mm", new Date()), "h:mm a");
  } catch {
    return time;
  }
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export const FUTURE_LOG_DATE_ERROR =
  "You can't log entries for future dates. Please choose today or an earlier day.";

export function isFutureLogDate(date: string): boolean {
  return date > todayISO();
}

export function validateLogDate(date: string): string | null {
  if (!date) return "Please choose a date.";
  if (isFutureLogDate(date)) return FUTURE_LOG_DATE_ERROR;
  return null;
}

export function validateNextInjectionDate(date: string): string | null {
  if (!date) return "Please choose a date.";
  if (date < todayISO()) return "Next injection must be today or later.";
  return null;
}

export function mergeMeasurementLog(
  existing: MeasurementLog | undefined,
  incoming: MeasurementLog
): MeasurementLog {
  return {
    id: existing?.id ?? incoming.id,
    date: incoming.date,
    unit: incoming.unit ?? existing?.unit ?? "in",
    waist: incoming.waist ?? existing?.waist,
    hips: incoming.hips ?? existing?.hips,
    leftArm: incoming.leftArm ?? existing?.leftArm,
    rightArm: incoming.rightArm ?? existing?.rightArm,
    chest: incoming.chest ?? existing?.chest,
    arms: incoming.arms ?? existing?.arms,
    thighs: incoming.thighs ?? existing?.thighs,
  };
}

export function defaultNextInjectionDate(daysAhead = 7): string {
  return format(addDays(new Date(), daysAhead), "yyyy-MM-dd");
}

export function getInjectionIntervalDays(medication: GLP1Medication): number {
  const med = MEDICATIONS.find((m) => m.id === medication);
  return med?.frequency.toLowerCase().includes("daily") ? 1 : 7;
}

export function advanceNextInjectionDate(
  fromDate: string,
  medication: GLP1Medication
): string {
  return format(
    addDays(parseISO(fromDate), getInjectionIntervalDays(medication)),
    "yyyy-MM-dd"
  );
}

export function profileWithNextInjectionFromLog(
  profile: UserProfile,
  injectionDate: string,
  medication: GLP1Medication = profile.medication
): UserProfile {
  const nextInjectionDate = advanceNextInjectionDate(
    injectionDate,
    medication
  );
  return {
    ...profile,
    nextInjectionDate,
    injectionDay: getDay(parseISO(nextInjectionDate)),
  };
}

export function getLastRelevantInjection(
  profile: UserProfile,
  injections: AppData["injections"]
): AppData["injections"][0] | null {
  if (injections.length === 0) return null;
  const sameMed = injections.filter((i) => i.medication === profile.medication);
  const pool = sameMed.length > 0 ? sameMed : injections;
  return pool.reduce((latest, current) =>
    current.date > latest.date ? current : latest
  );
}

export function hasCompletedScheduledInjection(
  profile: UserProfile,
  injections: AppData["injections"]
): boolean {
  if (!profile.nextInjectionDate) return false;
  const last = getLastRelevantInjection(profile, injections);
  if (!last) return false;
  const scheduled = startOfDay(parseISO(profile.nextInjectionDate));
  const lastDate = startOfDay(parseISO(last.date));
  return lastDate >= scheduled;
}

export function getSuggestedNextInjectionDate(
  profile: UserProfile,
  injectionDate: string,
  medication: GLP1Medication = profile.medication
): string {
  return advanceNextInjectionDate(injectionDate, medication);
}

export function recalculateProfileFromInjections(
  profile: UserProfile,
  injections: AppData["injections"]
): UserProfile {
  const last = getLastRelevantInjection(profile, injections);
  if (!last) return profile;
  const nextInjectionDate = advanceNextInjectionDate(
    last.date,
    profile.medication
  );
  return {
    ...profile,
    nextInjectionDate,
    injectionDay: getDay(parseISO(nextInjectionDate)),
  };
}

export function formatInjectionCountdown(daysUntil: number | null): string {
  if (daysUntil === null) return "Not scheduled";
  if (daysUntil < 0) return `${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? "" : "s"} overdue`;
  if (daysUntil === 0) return "Due today";
  if (daysUntil === 1) return "Due tomorrow";
  return `Due in ${daysUntil} days`;
}

export function getMedicationLabel(id: string): string {
  return MEDICATIONS.find((m) => m.id === id)?.brand ?? id;
}

export function getSiteLabel(id: InjectionSite): string {
  return INJECTION_SITES.find((s) => s.id === id)?.label ?? id;
}

export function getNextInjectionDate(
  profile: AppData["profile"],
  injections: AppData["injections"] = []
): Date | null {
  if (!profile) return null;
  const today = startOfDay(new Date());
  const interval = getInjectionIntervalDays(profile.medication);
  const lastInjection = getLastRelevantInjection(profile, injections);
  const scheduled = profile.nextInjectionDate
    ? startOfDay(parseISO(profile.nextInjectionDate))
    : null;

  // Scheduled dose logged — next date comes from the injection, not stale profile field.
  if (lastInjection && scheduled) {
    const lastDate = startOfDay(parseISO(lastInjection.date));
    if (lastDate >= scheduled) {
      return startOfDay(
        parseISO(
          advanceNextInjectionDate(lastInjection.date, profile.medication)
        )
      );
    }
    return scheduled;
  }

  if (scheduled) {
    return scheduled;
  }

  if (lastInjection) {
    let next = addDays(parseISO(lastInjection.date), interval);
    while (next < today) {
      next = addDays(next, interval);
    }
    return startOfDay(next);
  }

  // Legacy: next occurrence of injectionDay weekday
  for (let i = 0; i < 7; i++) {
    const candidate = addDays(today, i);
    if (candidate.getDay() === profile.injectionDay) {
      return candidate;
    }
  }
  return today;
}

export function getLastInjection(
  profile: AppData["profile"],
  injections: AppData["injections"]
) {
  if (injections.length > 0) return injections[0];
  return null;
}

export function getDaysUntilInjection(
  profile: AppData["profile"],
  injections: AppData["injections"]
): number | null {
  const next = getNextInjectionDate(profile, injections);
  if (!next) return null;
  return differenceInDays(startOfDay(next), startOfDay(new Date()));
}

export function getNextInjectionLabel(
  profile: AppData["profile"],
  injections: AppData["injections"]
): string | null {
  const next = getNextInjectionDate(profile, injections);
  if (!next) return null;
  return formatDate(next);
}

export function suggestNextInjectionSite(
  injections: AppData["injections"]
): InjectionSite {
  const recentSites = injections.slice(0, 3).map((i) => i.site);
  const available = INJECTION_SITES.filter(
    (s) => !recentSites.includes(s.id)
  );
  if (available.length > 0) {
    const zoneOrder = ["abdomen", "thigh", "arm"] as const;
    const lastZone = recentSites[0]
      ? INJECTION_SITES.find((s) => s.id === recentSites[0])?.zone
      : null;
    const nextZoneIdx = lastZone
      ? (zoneOrder.indexOf(lastZone) + 1) % zoneOrder.length
      : 0;
    const inZone = available.filter((s) => s.zone === zoneOrder[nextZoneIdx]);
    return (inZone[0] ?? available[0]).id;
  }
  const usage = INJECTION_SITES.map((site) => ({
    site: site.id,
    count: injections.filter((i) => i.site === site.id).length,
  }));
  usage.sort((a, b) => a.count - b.count);
  return usage[0].site;
}

export function getSiteRotationStatus(injections: AppData["injections"]) {
  return INJECTION_SITES.map((site) => ({
    ...site,
    lastUsed: injections.find((i) => i.site === site.id)?.date ?? null,
    count: injections.filter((i) => i.site === site.id).length,
  }));
}

export function getWeightProgress(weights: AppData["weights"]) {
  if (weights.length === 0) return null;
  const sorted = [...weights].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  const change = latest.weight - first.weight;
  return { first, latest, change, sorted };
}

export function getNutritionAverages(nutrition: AppData["nutrition"], days = 7) {
  const cutoff = subDays(new Date(), days);
  const recent = nutrition.filter((n) => parseISO(n.date) >= cutoff);
  if (recent.length === 0) return null;
  const totals = recent.reduce(
    (acc, n) => ({
      calories: acc.calories + n.calories,
      protein: acc.protein + n.protein,
      fiber: acc.fiber + n.fiber,
      water: acc.water + n.water,
    }),
    { calories: 0, protein: 0, fiber: 0, water: 0 }
  );
  const count = recent.length;
  return {
    calories: Math.round(totals.calories / count),
    protein: Math.round(totals.protein / count),
    fiber: Math.round(totals.fiber / count),
    water: Math.round(totals.water / count),
    daysLogged: count,
  };
}

export function analyzePatterns(data: AppData): PatternInsight[] {
  const insights: PatternInsight[] = [];
  const { injections, sideEffects, nutrition, weights, profile } = data;

  // Side effects after dosage changes
  const dosageChanges = injections.filter((i) => i.dosageChanged);
  for (const change of dosageChanges.slice(0, 3)) {
    const weekAfter = sideEffects.filter((s) => {
      const diff = differenceInDays(parseISO(s.date), parseISO(change.date));
      return diff >= 0 && diff <= 7;
    });
    const nauseaDays = weekAfter.filter((s) =>
      s.effects.some((e) => e.type === "nausea" && e.severity >= 3)
    );
    if (nauseaDays.length >= 2) {
      insights.push({
        id: `dosage-nausea-${change.id}`,
        type: "dosage",
        title: "Nausea after dosage increase",
        description: `You logged elevated nausea on ${nauseaDays.length} days within a week of your dosage change to ${change.dosage}${change.dosageUnit} on ${formatDate(change.date)}. This is common when titrating up.`,
        severity: "watch",
        relatedDates: nauseaDays.map((s) => s.date),
      });
    }
  }

  // Side effects near injection days
  for (const injection of injections.slice(0, 4)) {
    const dayOf = sideEffects.find((s) => s.date === injection.date);
    const dayAfter = sideEffects.find(
      (s) =>
        differenceInDays(parseISO(s.date), parseISO(injection.date)) === 1
    );
    if (dayOf || dayAfter) {
      const effects = [...(dayOf?.effects ?? []), ...(dayAfter?.effects ?? [])];
      const significant = effects.filter((e) => e.severity >= 3);
      if (significant.length >= 2) {
        insights.push({
          id: `injection-effects-${injection.id}`,
          type: "side-effect",
          title: "Symptoms near injection day",
          description: `Notable side effects appeared around your ${formatDate(injection.date)} injection. Tracking meals and hydration on injection days may help.`,
          severity: "info",
          relatedDates: [injection.date],
        });
        break;
      }
    }
  }

  // Low protein correlation with fatigue
  const lowProteinDays = nutrition.filter((n) => n.protein < (profile?.proteinGoal ?? 100) * 0.6);
  for (const day of lowProteinDays.slice(0, 5)) {
    const symptoms = sideEffects.find((s) => s.date === day.date);
    const fatigue = symptoms?.effects.find(
      (e) => (e.type === "fatigue" || e.type === "energy") && e.severity >= 3
    );
    if (fatigue) {
      insights.push({
        id: `protein-fatigue-${day.date}`,
        type: "nutrition",
        title: "Low protein & fatigue connection",
        description: `On ${formatDate(day.date)}, protein intake was ${day.protein}g (below your goal) and fatigue was elevated. Prioritizing protein may help energy levels on GLP-1.`,
        severity: "info",
        relatedDates: [day.date],
      });
      break;
    }
  }

  // Weight progress positive
  const progress = getWeightProgress(weights);
  if (progress && progress.change < -2 && weights.length >= 3) {
    insights.push({
      id: "weight-progress",
      type: "weight",
      title: "Steady progress on your journey",
      description: `You've logged a ${Math.abs(progress.change).toFixed(1)} ${progress.latest.unit} change since ${formatDate(progress.first.date)}. Consistency with injections and nutrition is paying off.`,
      severity: "positive",
      relatedDates: [progress.first.date, progress.latest.date],
    });
  }

  // Low fiber pattern
  const avg = getNutritionAverages(nutrition, 14);
  if (avg && avg.fiber < (profile?.fiberGoal ?? 25) * 0.7) {
    insights.push({
      id: "low-fiber",
      type: "nutrition",
      title: "Fiber intake below goal",
      description: `Your average fiber over ${avg.daysLogged} days is ${avg.fiber}g vs your ${profile?.fiberGoal ?? 25}g goal. Increasing fiber gradually can help with GLP-1-related digestive changes.`,
      severity: "watch",
      relatedDates: [],
    });
  }

  return insights.slice(0, 6);
}

export function generateMealPlan(
  calorieGoal: number,
  proteinGoal: number,
  fiberGoal: number
): DailyMealPlan {
  const breakfast = MEAL_TEMPLATES.filter((m) => m.mealType === "breakfast");
  const lunch = MEAL_TEMPLATES.filter((m) => m.mealType === "lunch");
  const dinner = MEAL_TEMPLATES.filter((m) => m.mealType === "dinner");
  const snacks = MEAL_TEMPLATES.filter((m) => m.mealType === "snack");

  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const pickTwoDifferent = <T,>(arr: T[]): [T, T] => {
    if (arr.length <= 1) return [pick(arr), pick(arr)];
    const first = pick(arr);
    let second = pick(arr);
    while (second === first) second = pick(arr);
    return [first, second];
  };

  const [morningSnack, afternoonSnack] = pickTwoDifferent(snacks);

  const meals: MealPlanItem[] = [
    { ...pick(breakfast), id: "b1", mealType: "breakfast" },
    { ...morningSnack, id: "s1", mealType: "morning-snack" },
    { ...pick(lunch), id: "l1", mealType: "lunch" },
    { ...afternoonSnack, id: "s2", mealType: "afternoon-snack" },
    { ...pick(dinner), id: "d1", mealType: "dinner" },
  ];

  const scaled = scaleMealsToCalorieGoal(meals, calorieGoal);
  const totals = mealPlanTotals(scaled);

  return {
    date: todayISO(),
    meals: scaled,
    ...totals,
  };
}

export function getTreatmentConsistency(
  injections: AppData["injections"],
  weeks = 8
): { onTime: number; total: number; percentage: number } {
  const expected = weeks;
  const recent = injections.filter((i) => {
    const diff = differenceInDays(new Date(), parseISO(i.date));
    return diff <= weeks * 7;
  });
  const percentage =
    expected > 0 ? Math.min(100, Math.round((recent.length / expected) * 100)) : 0;
  return { onTime: recent.length, total: expected, percentage };
}

export function getDosageHistory(injections: AppData["injections"]) {
  const changes: { date: string; dosage: number; unit: string }[] = [];
  let lastDosage: number | null = null;
  const sorted = [...injections].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );
  for (const inj of sorted) {
    if (lastDosage !== null && inj.dosage !== lastDosage) {
      changes.push({
        date: inj.date,
        dosage: inj.dosage,
        unit: inj.dosageUnit,
      });
    }
    if (lastDosage === null) {
      changes.push({
        date: inj.date,
        dosage: inj.dosage,
        unit: inj.dosageUnit,
      });
    }
    lastDosage = inj.dosage;
  }
  return changes;
}
