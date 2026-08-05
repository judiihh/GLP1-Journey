# Supabase Setup Guide — GLP-1 Tracker

Complete step-by-step instructions to connect your app to Supabase.

Your project from the screenshot:
- **Project name:** GLP1-Tracker
- **Region:** Canada (Central)
- **Project ref:** `qrgvkwfwzsyrhhmulnad` (visible in your dashboard URL)

---

## Step 1 — Confirm your Supabase project

You already created the project. In the [Supabase Dashboard](https://supabase.com/dashboard):

1. Open **GLP1-Tracker**
2. Confirm status is **Active** (green)

No further project creation needed.

---

## Step 2 — Run the database schema (SQL)

This creates all tables, relationships, indexes, triggers, and Row Level Security policies.

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `supabase/schema.sql` from this repo
4. Copy the **entire contents** and paste into the SQL editor
5. Click **Run**

### Tables created

| Table | Purpose | Relationship |
|-------|---------|--------------|
| `profiles` | User profile & goals | 1:1 with `auth.users` |
| `injections` | Injection logs | Many per user |
| `nutrition_logs` | Daily nutrition | One row per user per day |
| `weight_logs` | Weight entries | Many per user |
| `measurement_logs` | Body measurements | Many per user |
| `side_effect_logs` | Daily symptoms | One row per user per day |
| `reminder_settings` | Injection reminders | 1:1 with `auth.users` |
| `meal_plans` | Saved meal plans | One row per user per day |

All user-owned tables link to `auth.users(id)` via `user_id` (or `id` for profiles).

### Security

Row Level Security (RLS) is enabled on every table. Each policy restricts access to `auth.uid() = user_id`, so users can only read/write their own data.

A trigger `handle_new_user` automatically creates an empty `profiles` row and default `reminder_settings` when someone signs up.

---

## Step 3 — Configure authentication

1. Go to **Authentication → Providers**
2. Ensure **Email** is enabled (default)
3. For local testing, go to **Authentication → Settings**
4. Under **Email auth**, you can temporarily disable **Confirm email** so sign-up works instantly without checking email

   > For production, keep email confirmation enabled.

---

## Step 4 — Get your API credentials

Go to **Project Settings → API** (gear icon in sidebar).

You need **two values** (never share the service_role key in the frontend):

| Variable | Where to find it | Safe for frontend? |
|----------|------------------|--------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Project API keys → anon public** | Yes |
| `service_role` key | Same page | **NO — server only** |

Your Project URL will look like:
```
https://qrgvkwfwzsyrhhmulnad.supabase.co
```

---

## Step 5 — Add environment variables locally

1. In the project root, copy the example file:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and paste your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qrgvkwfwzsyrhhmulnad.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
```

3. **Never commit `.env.local`** — it is already in `.gitignore`

4. Restart the dev server after changing env vars:

```bash
npm run dev
```

---

## Step 6 — Install dependencies (if not done)

```bash
npm install
```

Packages added:
- `@supabase/supabase-js` — Supabase client
- `@supabase/ssr` — Session handling for Next.js

---

## Step 7 — Files added/changed in the app

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Database schema + RLS |
| `.env.local.example` | Template for env vars |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Server-side client |
| `src/lib/supabase/middleware.ts` | Auth session refresh |
| `src/lib/supabase/data.ts` | All database read/write operations |
| `src/middleware.ts` | Protects routes, redirects to `/login` |
| `src/hooks/useAuth.tsx` | Auth state (sign in/out) |
| `src/hooks/useAppData.tsx` | Loads/saves data via Supabase |
| `src/app/login/page.tsx` | Sign up / sign in page |
| `src/app/settings/page.tsx` | Connection test + sign out |

---

## Step 8 — Test the connection

1. Start the app:

```bash
npm run dev
```

2. Open http://localhost:3000 — you should be redirected to `/login`

3. **Create an account** with email + password

4. Complete onboarding (medication, schedule, goals)

5. Log an injection, weight entry, or symptom

6. In Supabase, go to **Table Editor** and verify rows appear in:
   - `profiles`
   - `injections` (or whichever you logged)

7. In the app, go to **Settings → Test Supabase connection**

   You should see: *"Connected to Supabase successfully."*

---

## Step 9 — Verify user isolation (RLS test)

1. Create **User A** in the app, log some data
2. Sign out (**Settings → Sign out**)
3. Create **User B**, log different data
4. User B should **not** see User A's data in the app
5. In Supabase Table Editor, each row's `user_id` should match the correct auth user

---

## What I need from you

To finish configuration, provide these **via `.env.local` on your machine** (do not paste secrets in chat):

1. **Project URL** — from Settings → API
2. **Anon public key** — from Settings → API

You do **not** need to give me:
- Your password
- Your `service_role` key
- Database password (unless using direct Postgres connection, which this app does not require)

---

## Troubleshooting

### `npm: command not found`
Load nvm in your terminal first:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

### Redirect loop or stuck on login
- Check `.env.local` values are correct
- Restart `npm run dev`
- Clear browser cookies for localhost

### `relation "profiles" does not exist`
- Run `supabase/schema.sql` in the SQL Editor

### Sign up works but no profile row
- Re-run the schema SQL (the `handle_new_user` trigger may be missing)
- Or manually insert in Table Editor

### RLS policy error when saving
- Confirm you are signed in
- Confirm RLS policies were created by the schema script

---

## Production deployment (Vercel / Netlify)

Add the same two environment variables in your hosting dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

In Supabase → Authentication → URL Configuration, add your production URL to **Site URL** and **Redirect URLs**.

---

## Security checklist

- ✅ Anon key in `NEXT_PUBLIC_*` env vars only
- ✅ RLS enabled on all tables
- ✅ Middleware protects routes when Supabase is configured
- ✅ Each user scoped to `auth.uid()`
- ❌ Never expose `service_role` key in frontend code
- ❌ Never commit `.env.local`
