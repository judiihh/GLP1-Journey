-- GLP-1 Tracker — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New query → Run

-- ============================================================
-- TABLES
-- ============================================================

-- User profile (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  medication text not null default 'ozempic',
  current_dosage numeric not null default 0.25,
  dosage_unit text not null default 'mg' check (dosage_unit in ('mg', 'units')),
  injection_day integer not null default 0 check (injection_day between 0 and 6),
  next_injection_date date,
  injection_time text not null default '09:00',
  start_date date not null default current_date,
  goal_weight numeric,
  goal_weight_unit text not null default 'lbs' check (goal_weight_unit in ('lbs', 'kg')),
  calorie_goal integer not null default 1500,
  protein_goal integer not null default 100,
  fiber_goal integer not null default 25,
  water_goal integer not null default 64,
  water_unit text not null default 'oz' check (water_unit in ('oz', 'ml')),
  exclude_shellfish boolean not null default true,
  exclude_pork boolean not null default true,
  exclude_duck boolean not null default true,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Injection logs
create table if not exists public.injections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  time text not null,
  medication text not null,
  dosage numeric not null,
  dosage_unit text not null default 'mg',
  site text not null,
  notes text,
  dosage_changed boolean not null default false,
  previous_dosage numeric,
  created_at timestamptz not null default now()
);

-- Nutrition logs (one row per user per day)
create table if not exists public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  calories integer not null default 0,
  protein integer not null default 0,
  fiber integer not null default 0,
  water integer not null default 0,
  carbs integer,
  fat integer,
  notes text,
  meal_breakdown jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Weight logs
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  weight numeric not null,
  unit text not null default 'lbs' check (unit in ('lbs', 'kg')),
  notes text,
  created_at timestamptz not null default now()
);

-- Body measurement logs
create table if not exists public.measurement_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  waist numeric,
  hips numeric,
  chest numeric,
  arms numeric,
  thighs numeric,
  unit text not null default 'in' check (unit in ('in', 'cm')),
  created_at timestamptz not null default now()
);

-- Side effect logs (one row per user per day)
create table if not exists public.side_effect_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  effects jsonb not null default '[]'::jsonb,
  energy_level integer,
  appetite_level integer,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Reminder settings (1:1 with auth.users)
create table if not exists public.reminder_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  enabled boolean not null default true,
  days_before integer not null default 1,
  time text not null default '09:00',
  updated_at timestamptz not null default now()
);

-- Saved meal plans (optional persistence)
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  meals jsonb not null default '[]'::jsonb,
  total_calories integer not null default 0,
  total_protein integer not null default 0,
  total_fiber integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Wellness assistant chat history
create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_injections_user_date on public.injections (user_id, date desc);
create index if not exists idx_nutrition_logs_user_date on public.nutrition_logs (user_id, date desc);
create index if not exists idx_weight_logs_user_date on public.weight_logs (user_id, date desc);
create index if not exists idx_measurement_logs_user_date on public.measurement_logs (user_id, date desc);
create index if not exists idx_side_effect_logs_user_date on public.side_effect_logs (user_id, date desc);
create index if not exists idx_meal_plans_user_date on public.meal_plans (user_id, date desc);
create index if not exists idx_assistant_messages_user_created on public.assistant_messages (user_id, created_at asc);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists reminder_settings_updated_at on public.reminder_settings;
create trigger reminder_settings_updated_at
  before update on public.reminder_settings
  for each row execute function public.set_updated_at();

-- Auto-create profile + reminders when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;

  insert into public.reminder_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.injections enable row level security;
alter table public.nutrition_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.measurement_logs enable row level security;
alter table public.side_effect_logs enable row level security;
alter table public.reminder_settings enable row level security;
alter table public.meal_plans enable row level security;
alter table public.assistant_messages enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- Injections
create policy "Users can view own injections"
  on public.injections for select
  using (auth.uid() = user_id);

create policy "Users can insert own injections"
  on public.injections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own injections"
  on public.injections for update
  using (auth.uid() = user_id);

create policy "Users can delete own injections"
  on public.injections for delete
  using (auth.uid() = user_id);

-- Nutrition logs
create policy "Users can view own nutrition logs"
  on public.nutrition_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own nutrition logs"
  on public.nutrition_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own nutrition logs"
  on public.nutrition_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own nutrition logs"
  on public.nutrition_logs for delete
  using (auth.uid() = user_id);

-- Weight logs
create policy "Users can view own weight logs"
  on public.weight_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own weight logs"
  on public.weight_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weight logs"
  on public.weight_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own weight logs"
  on public.weight_logs for delete
  using (auth.uid() = user_id);

-- Measurement logs
create policy "Users can view own measurement logs"
  on public.measurement_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own measurement logs"
  on public.measurement_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own measurement logs"
  on public.measurement_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own measurement logs"
  on public.measurement_logs for delete
  using (auth.uid() = user_id);

-- Side effect logs
create policy "Users can view own side effect logs"
  on public.side_effect_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own side effect logs"
  on public.side_effect_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own side effect logs"
  on public.side_effect_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own side effect logs"
  on public.side_effect_logs for delete
  using (auth.uid() = user_id);

-- Reminder settings
create policy "Users can view own reminders"
  on public.reminder_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own reminders"
  on public.reminder_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reminders"
  on public.reminder_settings for update
  using (auth.uid() = user_id);

create policy "Users can delete own reminders"
  on public.reminder_settings for delete
  using (auth.uid() = user_id);

-- Meal plans
create policy "Users can view own meal plans"
  on public.meal_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert own meal plans"
  on public.meal_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own meal plans"
  on public.meal_plans for update
  using (auth.uid() = user_id);

create policy "Users can delete own meal plans"
  on public.meal_plans for delete
  using (auth.uid() = user_id);

-- Assistant messages
create policy "Users can view own assistant messages"
  on public.assistant_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own assistant messages"
  on public.assistant_messages for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own assistant messages"
  on public.assistant_messages for delete
  using (auth.uid() = user_id);

-- ============================================================
-- MIGRATION (existing projects): run once if upgrading
-- ============================================================
-- alter table public.profiles add column if not exists next_injection_date date;
--
-- Assistant chat history (safe to re-run):
-- create table if not exists public.assistant_messages (
--   id uuid primary key default gen_random_uuid(),
--   user_id uuid not null references auth.users (id) on delete cascade,
--   role text not null check (role in ('user', 'assistant')),
--   content text not null,
--   created_at timestamptz not null default now()
-- );
-- create index if not exists idx_assistant_messages_user_created on public.assistant_messages (user_id, created_at asc);
-- alter table public.assistant_messages enable row level security;
-- drop policy if exists "Users can view own assistant messages" on public.assistant_messages;
-- drop policy if exists "Users can insert own assistant messages" on public.assistant_messages;
-- drop policy if exists "Users can delete own assistant messages" on public.assistant_messages;
-- create policy "Users can view own assistant messages" on public.assistant_messages for select using (auth.uid() = user_id);
-- create policy "Users can insert own assistant messages" on public.assistant_messages for insert with check (auth.uid() = user_id);
-- create policy "Users can delete own assistant messages" on public.assistant_messages for delete using (auth.uid() = user_id);
--
-- Dietary exclusions for AI meal plans (safe to re-run):
-- alter table public.profiles add column if not exists exclude_shellfish boolean not null default true;
-- alter table public.profiles add column if not exists exclude_pork boolean not null default true;
-- alter table public.profiles add column if not exists exclude_duck boolean not null default true;
--
-- AI food analyzer meal breakdown (safe to re-run):
-- alter table public.nutrition_logs add column if not exists meal_breakdown jsonb;
