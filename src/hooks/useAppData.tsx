"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AppData, ReminderSettings, UserProfile } from "@/lib/types";
import {
  loadData,
  saveData,
  updateProfile as storeUpdateProfile,
  addInjection as storeAddInjection,
  addNutrition as storeAddNutrition,
  addWeight as storeAddWeight,
  addMeasurement as storeAddMeasurement,
  addSideEffect as storeAddSideEffect,
  updateReminders as storeUpdateReminders,
} from "@/lib/storage";

interface AppContextValue {
  data: AppData;
  refresh: () => void;
  setProfile: (profile: UserProfile) => void;
  logInjection: (injection: AppData["injections"][0]) => void;
  logNutrition: (log: AppData["nutrition"][0]) => void;
  logWeight: (log: AppData["weights"][0]) => void;
  logMeasurement: (log: AppData["measurements"][0]) => void;
  logSideEffect: (log: AppData["sideEffects"][0]) => void;
  setReminders: (reminders: ReminderSettings) => void;
  isLoaded: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setData(loadData());
  }, []);

  useEffect(() => {
    setData(loadData());
    setIsLoaded(true);
  }, []);

  const setProfile = useCallback((profile: UserProfile) => {
    setData(storeUpdateProfile(profile));
  }, []);

  const logInjection = useCallback((injection: AppData["injections"][0]) => {
    setData(storeAddInjection(injection));
  }, []);

  const logNutrition = useCallback((log: AppData["nutrition"][0]) => {
    setData(storeAddNutrition(log));
  }, []);

  const logWeight = useCallback((log: AppData["weights"][0]) => {
    setData(storeAddWeight(log));
  }, []);

  const logMeasurement = useCallback((log: AppData["measurements"][0]) => {
    setData(storeAddMeasurement(log));
  }, []);

  const logSideEffect = useCallback((log: AppData["sideEffects"][0]) => {
    setData(storeAddSideEffect(log));
  }, []);

  const setReminders = useCallback((reminders: ReminderSettings) => {
    setData(storeUpdateReminders(reminders));
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="animate-pulse text-lavender-400 font-display text-lg">
          Loading your journey...
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        data,
        refresh,
        setProfile,
        logInjection,
        logNutrition,
        logWeight,
        logMeasurement,
        logSideEffect,
        setReminders,
        isLoaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
