import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AppData,
  DailyMealPlan,
  InjectionLog,
  MeasurementLog,
  NutritionLog,
  ReminderSettings,
  SideEffectLog,
  UserProfile,
  WeightLog,
} from "@/lib/types";
import { withProfileDefaults } from "@/lib/dietary-preferences";
import { mergeMeasurementLog } from "@/lib/utils";

const defaultReminders: ReminderSettings = {
  enabled: true,
  daysBefore: 1,
  time: "09:00",
};

// --- Row types (snake_case from DB) ---

interface ProfileRow {
  id: string;
  name: string;
  medication: string;
  current_dosage: number;
  dosage_unit: string;
  injection_day: number;
  next_injection_date: string | null;
  injection_time: string;
  start_date: string;
  goal_weight: number | null;
  goal_weight_unit: string;
  calorie_goal: number;
  protein_goal: number;
  fiber_goal: number;
  water_goal: number;
  water_unit: string;
  exclude_shellfish: boolean | null;
  exclude_pork: boolean | null;
  exclude_duck: boolean | null;
  onboarding_complete: boolean;
  created_at: string;
}

interface InjectionRow {
  id: string;
  user_id: string;
  date: string;
  time: string;
  medication: string;
  dosage: number;
  dosage_unit: string;
  site: string;
  notes: string | null;
  dosage_changed: boolean;
  previous_dosage: number | null;
}

interface NutritionRow {
  id: string;
  user_id: string;
  date: string;
  calories: number;
  protein: number;
  fiber: number;
  water: number;
  carbs: number | null;
  fat: number | null;
  notes: string | null;
}

interface WeightRow {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  unit: string;
  notes: string | null;
}

interface MeasurementRow {
  id: string;
  user_id: string;
  date: string;
  waist: number | null;
  hips: number | null;
  left_arm: number | null;
  right_arm: number | null;
  chest: number | null;
  arms: number | null;
  thighs: number | null;
  unit: string;
}

interface SideEffectRow {
  id: string;
  user_id: string;
  date: string;
  effects: SideEffectLog["effects"];
  energy_level: number | null;
  appetite_level: number | null;
  notes: string | null;
}

interface ReminderRow {
  user_id: string;
  enabled: boolean;
  days_before: number;
  time: string;
}

interface MealPlanRow {
  id: string;
  user_id: string;
  date: string;
  meals: DailyMealPlan["meals"];
  total_calories: number;
  total_protein: number;
  total_fiber: number;
}

// --- Mappers ---

function mapProfile(row: ProfileRow): UserProfile {
  return withProfileDefaults({
    id: row.id,
    name: row.name,
    medication: row.medication as UserProfile["medication"],
    currentDosage: Number(row.current_dosage),
    dosageUnit: row.dosage_unit as UserProfile["dosageUnit"],
    injectionDay: row.injection_day,
    nextInjectionDate: row.next_injection_date ?? undefined,
    injectionTime: row.injection_time,
    startDate: row.start_date,
    goalWeight: row.goal_weight ?? undefined,
    goalWeightUnit: row.goal_weight_unit as UserProfile["goalWeightUnit"],
    calorieGoal: row.calorie_goal,
    proteinGoal: row.protein_goal,
    fiberGoal: row.fiber_goal,
    waterGoal: row.water_goal,
    waterUnit: row.water_unit as UserProfile["waterUnit"],
    excludeShellfish: row.exclude_shellfish ?? undefined,
    excludePork: row.exclude_pork ?? undefined,
    excludeDuck: row.exclude_duck ?? undefined,
    onboardingComplete: row.onboarding_complete,
    createdAt: row.created_at,
  });
}

function profileToRow(profile: UserProfile) {
  return {
    id: profile.id,
    name: profile.name,
    medication: profile.medication,
    current_dosage: profile.currentDosage,
    dosage_unit: profile.dosageUnit,
    injection_day: profile.injectionDay,
    next_injection_date: profile.nextInjectionDate ?? null,
    injection_time: profile.injectionTime,
    start_date: profile.startDate,
    goal_weight: profile.goalWeight ?? null,
    goal_weight_unit: profile.goalWeightUnit,
    calorie_goal: profile.calorieGoal,
    protein_goal: profile.proteinGoal,
    fiber_goal: profile.fiberGoal,
    water_goal: profile.waterGoal,
    water_unit: profile.waterUnit,
    exclude_shellfish: profile.excludeShellfish ?? true,
    exclude_pork: profile.excludePork ?? true,
    exclude_duck: profile.excludeDuck ?? true,
    onboarding_complete: profile.onboardingComplete,
  };
}

function mapInjection(row: InjectionRow): InjectionLog {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    medication: row.medication as InjectionLog["medication"],
    dosage: Number(row.dosage),
    dosageUnit: row.dosage_unit as InjectionLog["dosageUnit"],
    site: row.site as InjectionLog["site"],
    notes: row.notes ?? undefined,
    dosageChanged: row.dosage_changed,
    previousDosage: row.previous_dosage ?? undefined,
  };
}

function mapNutrition(row: NutritionRow): NutritionLog {
  return {
    id: row.id,
    date: row.date,
    calories: row.calories,
    protein: row.protein,
    fiber: row.fiber,
    water: row.water,
    carbs: row.carbs ?? undefined,
    fat: row.fat ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function mapWeight(row: WeightRow): WeightLog {
  return {
    id: row.id,
    date: row.date,
    weight: Number(row.weight),
    unit: row.unit as WeightLog["unit"],
    notes: row.notes ?? undefined,
  };
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function mapMeasurement(row: MeasurementRow): MeasurementLog {
  return {
    id: row.id,
    date: row.date,
    waist: toOptionalNumber(row.waist),
    hips: toOptionalNumber(row.hips),
    leftArm: toOptionalNumber(row.left_arm) ?? toOptionalNumber(row.arms),
    rightArm: toOptionalNumber(row.right_arm),
    chest: toOptionalNumber(row.chest),
    arms: toOptionalNumber(row.arms),
    thighs: toOptionalNumber(row.thighs),
    unit: row.unit as MeasurementLog["unit"],
  };
}

function mapSideEffect(row: SideEffectRow): SideEffectLog {
  return {
    id: row.id,
    date: row.date,
    effects: row.effects ?? [],
    energyLevel: (row.energy_level ?? undefined) as SideEffectLog["energyLevel"],
    appetiteLevel: (row.appetite_level ?? undefined) as SideEffectLog["appetiteLevel"],
    notes: row.notes ?? undefined,
  };
}

function mapReminders(row: ReminderRow | null): ReminderSettings {
  if (!row) return defaultReminders;
  return {
    enabled: row.enabled,
    daysBefore: row.days_before,
    time: row.time,
  };
}

function mapMealPlan(row: MealPlanRow): DailyMealPlan {
  return {
    date: row.date,
    meals: row.meals,
    totalCalories: row.total_calories,
    totalProtein: row.total_protein,
    totalFiber: row.total_fiber,
  };
}

// --- Fetch all data ---

export async function fetchAppData(
  supabase: SupabaseClient,
  userId: string
): Promise<AppData> {
  const [
    profileRes,
    injectionsRes,
    nutritionRes,
    weightsRes,
    measurementsRes,
    sideEffectsRes,
    remindersRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("injections")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .order("time", { ascending: false }),
    supabase
      .from("nutrition_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false }),
    supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false }),
    supabase
      .from("measurement_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false }),
    supabase
      .from("side_effect_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false }),
    supabase
      .from("reminder_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (profileRes.error) throw profileRes.error;
  if (injectionsRes.error) throw injectionsRes.error;
  if (nutritionRes.error) throw nutritionRes.error;
  if (weightsRes.error) throw weightsRes.error;
  if (measurementsRes.error) throw measurementsRes.error;
  if (sideEffectsRes.error) throw sideEffectsRes.error;
  if (remindersRes.error) throw remindersRes.error;

  return {
    profile: profileRes.data
      ? mapProfile(profileRes.data as ProfileRow)
      : null,
    injections: (injectionsRes.data as InjectionRow[]).map(mapInjection),
    nutrition: (nutritionRes.data as NutritionRow[]).map(mapNutrition),
    weights: (weightsRes.data as WeightRow[]).map(mapWeight),
    measurements: (measurementsRes.data as MeasurementRow[]).map(mapMeasurement),
    sideEffects: (sideEffectsRes.data as SideEffectRow[]).map(mapSideEffect),
    reminders: mapReminders(remindersRes.data as ReminderRow | null),
  };
}

// --- Write operations ---

export async function upsertProfile(
  supabase: SupabaseClient,
  profile: UserProfile
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profileToRow(profile))
    .select("*")
    .single();

  if (error) throw error;
  return mapProfile(data as ProfileRow);
}

export async function insertInjection(
  supabase: SupabaseClient,
  userId: string,
  injection: InjectionLog
): Promise<InjectionLog> {
  const { data, error } = await supabase
    .from("injections")
    .insert({
      id: injection.id,
      user_id: userId,
      date: injection.date,
      time: injection.time,
      medication: injection.medication,
      dosage: injection.dosage,
      dosage_unit: injection.dosageUnit,
      site: injection.site,
      notes: injection.notes ?? null,
      dosage_changed: injection.dosageChanged ?? false,
      previous_dosage: injection.previousDosage ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapInjection(data as InjectionRow);
}

export async function updateInjection(
  supabase: SupabaseClient,
  userId: string,
  injection: InjectionLog
): Promise<InjectionLog> {
  const { data, error } = await supabase
    .from("injections")
    .update({
      date: injection.date,
      time: injection.time,
      medication: injection.medication,
      dosage: injection.dosage,
      dosage_unit: injection.dosageUnit,
      site: injection.site,
      notes: injection.notes ?? null,
      dosage_changed: injection.dosageChanged ?? false,
      previous_dosage: injection.previousDosage ?? null,
    })
    .eq("id", injection.id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return mapInjection(data as InjectionRow);
}

export async function deleteInjection(
  supabase: SupabaseClient,
  userId: string,
  injectionId: string
): Promise<void> {
  const { error } = await supabase
    .from("injections")
    .delete()
    .eq("id", injectionId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function upsertNutrition(
  supabase: SupabaseClient,
  userId: string,
  log: NutritionLog
): Promise<NutritionLog> {
  const { data, error } = await supabase
    .from("nutrition_logs")
    .upsert(
      {
        id: log.id,
        user_id: userId,
        date: log.date,
        calories: log.calories,
        protein: log.protein,
        fiber: log.fiber,
        water: log.water,
        carbs: log.carbs ?? null,
        fat: log.fat ?? null,
        notes: log.notes ?? null,
      },
      { onConflict: "user_id,date" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return mapNutrition(data as NutritionRow);
}

export async function updateNutrition(
  supabase: SupabaseClient,
  userId: string,
  log: NutritionLog,
  previousDate: string
): Promise<NutritionLog> {
  if (previousDate !== log.date) {
    await deleteNutrition(supabase, userId, log.id);
  }
  return upsertNutrition(supabase, userId, log);
}

export async function deleteNutrition(
  supabase: SupabaseClient,
  userId: string,
  nutritionId: string
): Promise<void> {
  const { error } = await supabase
    .from("nutrition_logs")
    .delete()
    .eq("id", nutritionId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function insertWeight(
  supabase: SupabaseClient,
  userId: string,
  log: WeightLog
): Promise<WeightLog> {
  const { data, error } = await supabase
    .from("weight_logs")
    .insert({
      id: log.id,
      user_id: userId,
      date: log.date,
      weight: log.weight,
      unit: log.unit,
      notes: log.notes ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapWeight(data as WeightRow);
}

export async function updateWeight(
  supabase: SupabaseClient,
  userId: string,
  log: WeightLog
): Promise<WeightLog> {
  const { data, error } = await supabase
    .from("weight_logs")
    .update({
      date: log.date,
      weight: log.weight,
      unit: log.unit,
      notes: log.notes ?? null,
    })
    .eq("id", log.id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return mapWeight(data as WeightRow);
}

export async function deleteWeight(
  supabase: SupabaseClient,
  userId: string,
  weightId: string
): Promise<void> {
  const { error } = await supabase
    .from("weight_logs")
    .delete()
    .eq("id", weightId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function insertMeasurement(
  supabase: SupabaseClient,
  userId: string,
  log: MeasurementLog
): Promise<MeasurementLog> {
  const { data: existingRow } = await supabase
    .from("measurement_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("date", log.date)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const merged = mergeMeasurementLog(
    existingRow ? mapMeasurement(existingRow as MeasurementRow) : undefined,
    log
  );

  const payload = {
    id: merged.id,
    user_id: userId,
    date: merged.date,
    waist: merged.waist ?? null,
    hips: merged.hips ?? null,
    left_arm: merged.leftArm ?? null,
    right_arm: merged.rightArm ?? null,
    chest: merged.chest ?? null,
    arms: merged.arms ?? null,
    thighs: merged.thighs ?? null,
    unit: merged.unit,
  };

  const { data, error } = await supabase
    .from("measurement_logs")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return mapMeasurement(data as MeasurementRow);
}

export async function updateMeasurement(
  supabase: SupabaseClient,
  userId: string,
  log: MeasurementLog,
  previousDate: string
): Promise<MeasurementLog> {
  if (previousDate !== log.date) {
    await deleteMeasurementsByDate(supabase, userId, previousDate);
  }

  const { error: cleanupError } = await supabase
    .from("measurement_logs")
    .delete()
    .eq("user_id", userId)
    .eq("date", log.date)
    .neq("id", log.id);

  if (cleanupError) throw cleanupError;

  const payload = {
    id: log.id,
    user_id: userId,
    date: log.date,
    waist: log.waist ?? null,
    hips: log.hips ?? null,
    left_arm: log.leftArm ?? null,
    right_arm: log.rightArm ?? null,
    chest: log.chest ?? null,
    arms: log.arms ?? null,
    thighs: log.thighs ?? null,
    unit: log.unit,
  };

  const { data, error } = await supabase
    .from("measurement_logs")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return mapMeasurement(data as MeasurementRow);
}

export async function deleteMeasurementsByDate(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<void> {
  const { error } = await supabase
    .from("measurement_logs")
    .delete()
    .eq("user_id", userId)
    .eq("date", date);

  if (error) throw error;
}

export async function upsertSideEffect(
  supabase: SupabaseClient,
  userId: string,
  log: SideEffectLog
): Promise<SideEffectLog> {
  const { data, error } = await supabase
    .from("side_effect_logs")
    .upsert(
      {
        id: log.id,
        user_id: userId,
        date: log.date,
        effects: log.effects,
        energy_level: log.energyLevel ?? null,
        appetite_level: log.appetiteLevel ?? null,
        notes: log.notes ?? null,
      },
      { onConflict: "user_id,date" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return mapSideEffect(data as SideEffectRow);
}

export async function upsertReminders(
  supabase: SupabaseClient,
  userId: string,
  reminders: ReminderSettings
): Promise<ReminderSettings> {
  const { data, error } = await supabase
    .from("reminder_settings")
    .upsert({
      user_id: userId,
      enabled: reminders.enabled,
      days_before: reminders.daysBefore,
      time: reminders.time,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapReminders(data as ReminderRow);
}

export async function upsertMealPlan(
  supabase: SupabaseClient,
  userId: string,
  plan: DailyMealPlan
): Promise<DailyMealPlan> {
  const { data, error } = await supabase
    .from("meal_plans")
    .upsert(
      {
        user_id: userId,
        date: plan.date,
        meals: plan.meals,
        total_calories: plan.totalCalories,
        total_protein: plan.totalProtein,
        total_fiber: plan.totalFiber,
      },
      { onConflict: "user_id,date" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return mapMealPlan(data as MealPlanRow);
}

export async function fetchMealPlan(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<DailyMealPlan | null> {
  const { data, error } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (error) throw error;
  return data ? mapMealPlan(data as MealPlanRow) : null;
}

export async function deleteAllUserData(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await Promise.all([
    supabase.from("injections").delete().eq("user_id", userId),
    supabase.from("nutrition_logs").delete().eq("user_id", userId),
    supabase.from("weight_logs").delete().eq("user_id", userId),
    supabase.from("measurement_logs").delete().eq("user_id", userId),
    supabase.from("side_effect_logs").delete().eq("user_id", userId),
    supabase.from("meal_plans").delete().eq("user_id", userId),
    supabase.from("assistant_messages").delete().eq("user_id", userId),
    supabase
      .from("profiles")
      .update({ onboarding_complete: false, name: "" })
      .eq("id", userId),
  ]);
}

export async function testConnection(
  supabase: SupabaseClient
): Promise<{ ok: boolean; message: string }> {
  const { error } = await supabase.from("profiles").select("id").limit(1);
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true, message: "Connected to Supabase successfully." };
}
