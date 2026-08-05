# 💜 GLP-1 Journey

A calm, supportive wellness companion for your GLP-1 medication journey. Track injections, nutrition, progress, symptoms, meal plans, and generate doctor-ready reports — all in one beautiful app.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ecf8e)

---

## ✨ Features

### 💉 Medication & Injection Tracking
- 🏷️ Select from **Ozempic, Wegovy, Mounjaro, Zepbound, Trulicity, Saxenda, Victoza, Rybelsus, Retatrutide**, and more
- 📝 Log injections with date, time, dosage, injection site, and notes
- 💊 **Per-injection medication selector** — profile med is the default, but each log can record a different medication
- 📈 Track dosage changes over time with visual badges
- 🗺️ Visual **injection site rotation map** with smart next-site suggestions
- ✏️ **Edit or delete** any injection from history
- 📋 Full injection history with medication shown per entry

### 🔔 Reminders
- 🔔 Browser notifications before your next scheduled injection
- ⏰ Configurable reminder timing (injection day, 1 day before, 2 days before)

### 🥗 Nutrition
- 📊 Daily logging for calories, protein, fiber, and water
- 📶 Progress bars against your personal goals
- 📉 14-day trend charts
- 💡 GLP-1-specific nutrition tips

### 📏 Progress & Weight
- ⚖️ Weight tracking with beautiful trend charts
- 📐 Body measurements (waist, hips)
- 🎯 Goal progress ring visualization
- 📜 Full weight history with **notes on every entry**
- ✏️ **Edit or delete** any weight entry from history

### 🤒 Symptoms
- 🩺 Track nausea, fatigue, constipation, appetite changes, headaches, energy, and more
- 📊 5-point severity scale with intuitive UI
- 📈 Symptom trend charts over time

### 💡 Pattern Insights
- 🔍 Automatic analysis of connections between:
  - 💊 Dosage changes and side effects
  - ⏱️ Injection timing and symptoms
  - 🥩 Low protein days and fatigue
  - 🏆 Weight progress milestones
  - 🌾 Fiber intake patterns

### 🍽️ Meal Plans
- ✨ One-tap **GLP-1-friendly daily meal plans**
- 🎯 Calibrated to your calorie, protein, and fiber goals
- 🥣 Breakfast, lunch, dinner, and snack with macros and tips
- 💡 Gentle-on-stomach suggestions for nausea-sensitive days
- 📄 **Download meal plan as PDF** — print or save for later

### 📋 Medical Report (PDF)
- 📥 One-tap PDF generation for doctor appointments
- 📑 Includes medication history, dosage changes, weight progress, side effects, nutrition averages, and injection records

### 👤 Profile & Account
- 🔐 **Sign up / sign in** with email and password (Supabase Auth)
- ☁️ **Cloud sync** — your data follows you across devices when signed in
- 👋 Sidebar **profile card** with name, medication, and quick link to Settings
- 🧪 Connection test in Settings to verify Supabase is working
- 🚪 Sign out anytime from Settings

### 📱 Mobile Experience
- 🍔 **Hamburger menu** on phones — full navigation in a slide-out drawer
- 👤 Profile accessible from the mobile menu
- 📲 Responsive layouts — cards, forms, and charts stack cleanly on small screens
- 👆 Touch-friendly buttons and spacing (optimized for iPhone and Android)
- 🖥️ **Desktop unchanged** — full left sidebar at larger breakpoints

### 🎨 Design
- 🌸 Calm pastel aesthetic (lavender primary, rose, turquoise, sage accents)
- 🧘 Clean, intuitive, non-clinical feel
- 📱 Fully responsive — polished on mobile and desktop

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### 1️⃣ Install & Run Locally

```bash
cd "GLP-1 Tracker"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2️⃣ Connect Supabase (recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the Supabase SQL Editor
3. Copy `.env.local.example` to `.env.local` and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key_here
```

4. Restart the dev server

📖 Full setup guide: [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)

### 3️⃣ Build for Production

```bash
npm run build
npm start
```

---

## 🌐 Deploy to Render

The app is ready to deploy on [Render](https://render.com) as a **Web Service**:

| Setting | Value |
|---------|--------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start -- -H 0.0.0.0 -p $PORT` |

**Environment variables** (same as `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

After deploy, add your Render URL in **Supabase → Authentication → URL Configuration** (Site URL + Redirect URLs).

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Charts** | Recharts |
| **PDF** | jsPDF + jspdf-autotable |
| **Auth & Database** | Supabase (PostgreSQL + Row Level Security) |
| **Fallback Storage** | LocalStorage (when Supabase is not configured) |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
src/
├── app/                      # Pages (dashboard, injections, nutrition, etc.)
├── components/
│   ├── charts/               # Trend charts, body map
│   ├── injections/           # Injection history item (edit/delete)
│   ├── layout/               # Sidebar, mobile menu, profile, app shell
│   ├── onboarding/           # First-run setup wizard
│   ├── progress/             # Weight history item (edit/delete)
│   └── ui/                   # Buttons, cards, inputs, progress
├── hooks/                    # Auth, app data, reminders
├── lib/
│   ├── supabase/             # Client, server, middleware, data layer
│   ├── constants.ts          # Medications, sites, meal templates
│   ├── pdf-report.ts         # Medical summary PDF
│   ├── pdf-meal-plan.ts      # Meal plan PDF download
│   ├── storage.ts            # LocalStorage fallback
│   ├── types.ts              # TypeScript interfaces
│   └── utils.ts              # Pattern analysis, meal plans, helpers
└── middleware.ts               # Auth session + route protection

supabase/
└── schema.sql                # Database tables, RLS policies, triggers
```

---

## 📄 Pages

| Route | Description |
|-------|-------------|
| `/` | 🏠 Dashboard — overview, countdown, quick stats |
| `/injections` | 💉 Log injections, site rotation, history |
| `/nutrition` | 🥗 Daily nutrition logging |
| `/progress` | 📏 Weight & body measurements |
| `/symptoms` | 🤒 Side effect tracking |
| `/meals` | 🍽️ GLP-1 meal plan generator |
| `/insights` | 💡 Pattern insights |
| `/report` | 📋 Medical PDF report |
| `/settings` | ⚙️ Profile, reminders, account |
| `/login` | 🔐 Sign in / sign up |

---

## 🔒 Privacy & Security

- ☁️ When using Supabase, data is stored in **your** Supabase project with **Row Level Security** — each user can only access their own records
- 🔑 Only the public (anon/publishable) key is used in the frontend; never expose the service role key
- 💾 Without Supabase configured, the app falls back to **LocalStorage** in your browser only
- 📤 PDF exports are generated locally and downloaded to your device — nothing is sent unless you choose to share

---

## ⚠️ Disclaimer

This app is for personal tracking and informational purposes only. It is not medical advice. Always consult your healthcare provider for treatment decisions.

---

Built with care for the GLP-1 community 💜
