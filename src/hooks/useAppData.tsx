"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AppData, ReminderSettings, UserProfile } from "@/lib/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  deleteAllUserData,
  deleteInjection as supabaseDeleteInjection,
  fetchAppData,
  insertInjection,
  insertMeasurement,
  updateMeasurement as supabaseUpdateMeasurement,
  deleteMeasurementsByDate as supabaseDeleteMeasurementsByDate,
  insertWeight,
  updateWeight as supabaseUpdateWeight,
  deleteWeight as supabaseDeleteWeight,
  updateInjection as supabaseUpdateInjection,
  upsertNutrition,
  updateNutrition as supabaseUpdateNutrition,
  deleteNutrition as supabaseDeleteNutrition,
  upsertProfile,
  upsertReminders,
  upsertSideEffect,
} from "@/lib/supabase/data";
import {
  loadData,
  addInjection as localAddInjection,
  addMeasurement as localAddMeasurement,
  updateMeasurement as localUpdateMeasurement,
  deleteMeasurementsByDate as localDeleteMeasurementsByDate,
  addNutrition as localAddNutrition,
  updateNutrition as localUpdateNutrition,
  deleteNutrition as localDeleteNutrition,
  addSideEffect as localAddSideEffect,
  addWeight as localAddWeight,
  updateWeight as localUpdateWeight,
  deleteWeight as localDeleteWeight,
  updateProfile as localUpdateProfile,
  updateReminders as localUpdateReminders,
  deleteInjection as localDeleteInjection,
  updateInjection as localUpdateInjection,
  clearAllData as localClearAllData,
} from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import {
  applyProfileInjectionDoses,
  getInjectionDoses,
  profileWithNextInjectionFromLog,
  recalculateProfileFromInjections,
} from "@/lib/utils";

interface AppContextValue {
  data: AppData;
  refresh: () => Promise<void>;
  setProfile: (profile: UserProfile) => Promise<void>;
  logInjection: (injection: AppData["injections"][0]) => Promise<void>;
  updateInjection: (injection: AppData["injections"][0]) => Promise<void>;
  deleteInjection: (id: string) => Promise<void>;
  logNutrition: (log: AppData["nutrition"][0]) => Promise<void>;
  updateNutrition: (
    log: AppData["nutrition"][0],
    previousDate: string
  ) => Promise<void>;
  deleteNutrition: (id: string) => Promise<void>;
  logWeight: (log: AppData["weights"][0]) => Promise<void>;
  updateWeight: (log: AppData["weights"][0]) => Promise<void>;
  deleteWeight: (id: string) => Promise<void>;
  logMeasurement: (log: AppData["measurements"][0]) => Promise<void>;
  updateMeasurement: (
    log: AppData["measurements"][0],
    previousDate: string
  ) => Promise<void>;
  deleteMeasurement: (date: string) => Promise<void>;
  logSideEffect: (log: AppData["sideEffects"][0]) => Promise<void>;
  setReminders: (reminders: ReminderSettings) => Promise<void>;
  clearAllData: () => Promise<void>;
  isLoaded: boolean;
  isSaving: boolean;
  error: string | null;
  usingSupabase: boolean;
}

const emptyData: AppData = {
  profile: null,
  injections: [],
  nutrition: [],
  weights: [],
  measurements: [],
  sideEffects: [],
  reminders: { enabled: true, daysBefore: 1, time: "09:00" },
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>(emptyData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const usingSupabase = isSupabaseConfigured();
  const supabase = useMemo(
    () => (usingSupabase ? createClient() : null),
    [usingSupabase]
  );

  const refresh = useCallback(async () => {
    setError(null);
    if (usingSupabase && supabase && user) {
      try {
        const appData = await fetchAppData(supabase, user.id);
        setData(appData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      }
    } else if (!usingSupabase) {
      setData(loadData());
    }
    setIsLoaded(true);
  }, [usingSupabase, supabase, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setProfile = useCallback(
    async (profile: UserProfile) => {
      setIsSaving(true);
      setError(null);
      try {
        if (usingSupabase && supabase && user) {
          const saved = await upsertProfile(supabase, {
            ...profile,
            id: user.id,
          });
          setData((prev) => ({ ...prev, profile: saved }));
        } else {
          setData(localUpdateProfile(profile));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save profile");
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [usingSupabase, supabase, user]
  );

  const logInjection = useCallback(
    async (injection: AppData["injections"][0]) => {
      setIsSaving(true);
      setError(null);
      try {
        if (usingSupabase && supabase && user) {
          const saved = await insertInjection(supabase, user.id, injection);
          let profileUpdate: UserProfile | null = null;
          setData((prev) => {
            if (prev.profile) {
              profileUpdate = mergeProfileAfterInjection(prev.profile, injection);
            }
            return {
              ...prev,
              injections: [saved, ...prev.injections],
              profile: profileUpdate ?? prev.profile,
            };
          });
          if (profileUpdate) {
            await upsertProfile(supabase, profileUpdate);
          }
        } else {
          setData((prev) => {
            let next = localAddInjection(injection);
            if (prev.profile) {
              next = localUpdateProfile(
                mergeProfileAfterInjection(prev.profile, injection)
              );
            }
            return next;
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to log injection");
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [usingSupabase, supabase, user]
  );

  const updateInjection = useCallback(
    async (injection: AppData["injections"][0]) => {
      setIsSaving(true);
      setError(null);
      try {
        if (usingSupabase && supabase && user) {
          const saved = await supabaseUpdateInjection(
            supabase,
            user.id,
            injection
          );
          let profileUpdate: UserProfile | null = null;
          setData((prev) => {
            const injections = prev.injections.map((i) =>
              i.id === saved.id ? saved : i
            );
            if (prev.profile) {
              profileUpdate = recalculateProfileFromInjections(
                prev.profile,
                injections
              );
            }
            return {
              ...prev,
              injections,
              profile: profileUpdate ?? prev.profile,
            };
          });
          if (profileUpdate) {
            await upsertProfile(supabase, profileUpdate);
          }
        } else {
          setData((prev) => {
            const next = localUpdateInjection(injection);
            if (next.profile) {
              return {
                ...next,
                profile: recalculateProfileFromInjections(
                  next.profile,
                  next.injections
                ),
              };
            }
            return next;
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update injection"
        );
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [usingSupabase, supabase, user]
  );

  const deleteInjection = useCallback(
    async (id: string) => {
      setIsSaving(true);
      setError(null);
      try {
        if (usingSupabase && supabase && user) {
          await supabaseDeleteInjection(supabase, user.id, id);
          let profileUpdate: UserProfile | null = null;
          setData((prev) => {
            const injections = prev.injections.filter((i) => i.id !== id);
            if (prev.profile) {
              profileUpdate = recalculateProfileFromInjections(
                prev.profile,
                injections
              );
            }
            return {
              ...prev,
              injections,
              profile: profileUpdate ?? prev.profile,
            };
          });
          if (profileUpdate) {
            await upsertProfile(supabase, profileUpdate);
          }
        } else {
          setData((prev) => {
            const next = localDeleteInjection(id);
            if (next.profile) {
              return {
                ...next,
                profile: recalculateProfileFromInjections(
                  next.profile,
                  next.injections
                ),
              };
            }
            return next;
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete injection"
        );
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [usingSupabase, supabase, user]
  );

  const logNutrition = useCallback(
    async (log: AppData["nutrition"][0]) => {
      setIsSaving(true);
      setError(null);
      try {
        if (usingSupabase && supabase && user) {
          const saved = await upsertNutrition(supabase, user.id, log);
          setData((prev) => {
            const idx = prev.nutrition.findIndex((n) => n.date === saved.date);
            const nutrition =
              idx >= 0
                ? prev.nutrition.map((n, i) => (i === idx ? saved : n))
                : [saved, ...prev.nutrition];
            nutrition.sort((a, b) => b.date.localeCompare(a.date));
            return { ...prev, nutrition };
          });
        } else {
          setData(localAddNutrition(log));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to log nutrition");
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [usingSupabase, supabase, user]
  );

  const updateNutrition = useCallback(
    async (log: AppData["nutrition"][0], previousDate: string) => {
      setIsSaving(true);
      setError(null);
      try {
        if (usingSupabase && supabase && user) {
          const saved = await supabaseUpdateNutrition(
            supabase,
            user.id,
            log,
            previousDate
          );
          setData((prev) => {
            const nutrition = prev.nutrition
              .filter((n) => n.id !== log.id)
              .filter((n) => n.date !== saved.date);
            nutrition.unshift(saved);
            nutrition.sort((a, b) => b.date.localeCompare(a.date));
            return { ...prev, nutrition };
          });
        } else {
          setData(localUpdateNutrition(log, previousDate));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update nutrition"
        );
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [usingSupabase, supabase, user]
  );

  const deleteNutrition = useCallback(
    async (id: string) => {
      setIsSaving(true);
      setError(null);
      try {
        if (usingSupabase && supabase && user) {
          await supabaseDeleteNutrition(supabase, user.id, id);
          setData((prev) => ({
            ...prev,
            nutrition: prev.nutrition.filter((n) => n.id !== id),
          }));
        } else {
          setData(localDeleteNutrition(id));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete nutrition"
        );
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [usingSupabase, supabase, user]
  );

  const logWeight = useCallback(
    async (log: AppData["weights"][0]) => {
      setIsSaving(true);
      setError(null);
      try {
        if (usingSupabase && supabase && user) {
          const saved = await insertWeight(supabase, user.id, log);
          setData((prev) => ({
            ...prev,
            weights: [saved, ...prev.weights],
          }));
        } else {
          setData(localAddWeight(log));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to log weight");
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [usingSupabase, supabase, user]
  );

  const updateWeight = useCallback(
    async (log: AppData["weights"][0]) => {
      setIsSaving(true);
      setError(null);
      try {
        if (usingSupabase && supabase && user) {
          const saved = await supabaseUpdateWeight(supabase, user.id, log);
          setData((prev) => ({
            ...prev,
            weights: prev.weights
              .map((w) => (w.id === saved.id ? saved : w))
              .sort((a, b) => b.date.localeCompare(a.date)),
          }));
        } else {
          setData(localUpdateWeight(log));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update weight"
        );
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [usingSupabase, supabase, user]
  );

  const deleteWeight = useCallback(
    async (id: string) => {
      setIsSaving(true);
      setError(null);
      try {
        if (usingSupabase && supabase && user) {
          await supabaseDeleteWeight(supabase, user.id, id);
          setData((prev) => ({
            ...prev,
            weights: prev.weights.filter((w) => w.id !== id),
          }));
        } else {
          setData(localDeleteWeight(id));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete weight"
        );
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [usingSupabase, supabase, user]
  );

  const logMeasurement = useCallback(
    async (log: AppData["measurements"][0]) => {
      setIsSaving(true);
      setError(null);
      try {
        if (usingSupabase && supabase && user) {
          const saved = await insertMeasurement(supabase, user.id, log);
          setData((prev) => ({
            ...prev,
            measurements: [
              saved,
              ...prev.measurements.filter((m) => m.date !== saved.date),
            ].sort((a, b) => b.date.localeCompare(a.date)),
          }));
        } else {
          setData(localAddMeasurement(log));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to log measurement"
        );
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [usingSupabase, supabase, user]
  );

  const updateMeasurement = useCallback(
    async (log: AppData["measurements"][0], previousDate: string) => {
      setIsSaving(true);
      setError(null);
      try {
        if (usingSupabase && supabase && user) {
          const saved = await supabaseUpdateMeasurement(
            supabase,
            user.id,
            log,
            previousDate
          );
          setData((prev) => ({
            ...prev,
            measurements: [
              saved,
              ...prev.measurements.filter(
                (m) => m.date !== previousDate && m.date !== saved.date
              ),
            ].sort((a, b) => b.date.localeCompare(a.date)),
          }));
        } else {
          setData(localUpdateMeasurement(log, previousDate));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update measurement"
        );
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [usingSupabase, supabase, user]
  );

  const deleteMeasurement = useCallback(
    async (date: string) => {
      setIsSaving(true);
      setError(null);
      try {
        if (usingSupabase && supabase && user) {
          await supabaseDeleteMeasurementsByDate(supabase, user.id, date);
          setData((prev) => ({
            ...prev,
            measurements: prev.measurements.filter((m) => m.date !== date),
          }));
        } else {
          setData(localDeleteMeasurementsByDate(date));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete measurement"
        );
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [usingSupabase, supabase, user]
  );

  const logSideEffect = useCallback(
    async (log: AppData["sideEffects"][0]) => {
      setIsSaving(true);
      setError(null);
      try {
        if (usingSupabase && supabase && user) {
          const saved = await upsertSideEffect(supabase, user.id, log);
          setData((prev) => {
            const idx = prev.sideEffects.findIndex((s) => s.date === saved.date);
            const sideEffects =
              idx >= 0
                ? prev.sideEffects.map((s, i) => (i === idx ? saved : s))
                : [saved, ...prev.sideEffects];
            return { ...prev, sideEffects };
          });
        } else {
          setData(localAddSideEffect(log));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to log side effects"
        );
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [usingSupabase, supabase, user]
  );

  const setReminders = useCallback(
    async (reminders: ReminderSettings) => {
      setIsSaving(true);
      setError(null);
      try {
        if (usingSupabase && supabase && user) {
          const saved = await upsertReminders(supabase, user.id, reminders);
          setData((prev) => ({ ...prev, reminders: saved }));
        } else {
          setData(localUpdateReminders(reminders));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save reminders");
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [usingSupabase, supabase, user]
  );

  const clearAllData = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      if (usingSupabase && supabase && user) {
        await deleteAllUserData(supabase, user.id);
        await refresh();
      } else {
        localClearAllData();
        setData(loadData());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear data");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [usingSupabase, supabase, user, refresh]);

  if (!isLoaded) {
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
        updateInjection,
        deleteInjection,
        logNutrition,
        updateNutrition,
        deleteNutrition,
        logWeight,
        updateWeight,
        deleteWeight,
        logMeasurement,
        updateMeasurement,
        deleteMeasurement,
        logSideEffect,
        setReminders,
        clearAllData,
        isLoaded,
        isSaving,
        error,
        usingSupabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

function mergeProfileAfterInjection(
  profile: UserProfile,
  injection: AppData["injections"][0]
): UserProfile {
  let updated = profileWithNextInjectionFromLog(
    profile,
    injection.date,
    profile.medication
  );
  if (injection.dosageChanged) {
    updated = applyProfileInjectionDoses(updated, getInjectionDoses(injection));
  }
  return updated;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
