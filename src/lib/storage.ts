"use client";

import type { AppData, ReminderSettings, UserProfile } from "./types";

const STORAGE_KEY = "glp1-tracker-data";

const defaultReminders: ReminderSettings = {
  enabled: true,
  daysBefore: 1,
  time: "09:00",
};

const defaultData: AppData = {
  profile: null,
  injections: [],
  nutrition: [],
  weights: [],
  measurements: [],
  sideEffects: [],
  reminders: defaultReminders,
};

export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function updateProfile(profile: UserProfile): AppData {
  const data = loadData();
  data.profile = profile;
  saveData(data);
  return data;
}

export function addInjection(
  injection: AppData["injections"][0]
): AppData {
  const data = loadData();
  data.injections.unshift(injection);
  saveData(data);
  return data;
}

export function updateInjection(
  injection: AppData["injections"][0]
): AppData {
  const data = loadData();
  const index = data.injections.findIndex((i) => i.id === injection.id);
  if (index >= 0) {
    data.injections[index] = injection;
  }
  saveData(data);
  return data;
}

export function deleteInjection(id: string): AppData {
  const data = loadData();
  data.injections = data.injections.filter((i) => i.id !== id);
  saveData(data);
  return data;
}

export function addNutrition(log: AppData["nutrition"][0]): AppData {
  const data = loadData();
  const existing = data.nutrition.findIndex((n) => n.date === log.date);
  if (existing >= 0) {
    data.nutrition[existing] = log;
  } else {
    data.nutrition.unshift(log);
  }
  saveData(data);
  return data;
}

export function addWeight(log: AppData["weights"][0]): AppData {
  const data = loadData();
  data.weights.unshift(log);
  saveData(data);
  return data;
}

export function updateWeight(log: AppData["weights"][0]): AppData {
  const data = loadData();
  const index = data.weights.findIndex((w) => w.id === log.id);
  if (index >= 0) {
    data.weights[index] = log;
    data.weights.sort((a, b) => b.date.localeCompare(a.date));
  }
  saveData(data);
  return data;
}

export function deleteWeight(id: string): AppData {
  const data = loadData();
  data.weights = data.weights.filter((w) => w.id !== id);
  saveData(data);
  return data;
}

export function addMeasurement(log: AppData["measurements"][0]): AppData {
  const data = loadData();
  data.measurements.unshift(log);
  saveData(data);
  return data;
}

export function addSideEffect(log: AppData["sideEffects"][0]): AppData {
  const data = loadData();
  const existing = data.sideEffects.findIndex((s) => s.date === log.date);
  if (existing >= 0) {
    data.sideEffects[existing] = log;
  } else {
    data.sideEffects.unshift(log);
  }
  saveData(data);
  return data;
}

export function updateReminders(reminders: ReminderSettings): AppData {
  const data = loadData();
  data.reminders = reminders;
  saveData(data);
  return data;
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
