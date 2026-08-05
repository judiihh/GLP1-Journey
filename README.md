# GLP-1 Journey

A calm, supportive wellness companion for your GLP-1 medication journey. Track injections, nutrition, progress, symptoms, and generate doctor-ready reports — all in one beautiful app.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## Features

### Medication Tracking
- Select from Ozempic, Wegovy, Mounjaro, Zepbound, Trulicity, Saxenda, Victoza, Rybelsus, and more
- Log injections with date, time, dosage, and notes
- Track dosage changes over time
- Visual injection site rotation map with smart suggestions

### Reminders
- Browser notifications before your next scheduled injection
- Configurable reminder timing (injection day, 1 day before, 2 days before)

### Nutrition
- Daily logging for calories, protein, fiber, and water
- Progress bars against your personal goals
- 14-day trend charts
- GLP-1-specific nutrition tips

### Progress
- Weight tracking with beautiful trend charts
- Body measurements (waist, hips)
- Goal progress visualization
- Full weight history

### Symptoms
- Track nausea, fatigue, constipation, appetite changes, headaches, energy, and more
- 5-point severity scale with intuitive UI
- Symptom trend charts over time

### Pattern Insights
- Automatic analysis of connections between:
  - Dosage changes and side effects
  - Injection timing and symptoms
  - Low protein days and fatigue
  - Weight progress milestones
  - Fiber intake patterns

### Meal Plans
- One-tap GLP-1-friendly daily meal plans
- Focused on protein, fiber, hydration, and smaller portions
- Gentle-on-stomach meal suggestions with tips

### Medical Report (PDF)
- One-tap PDF generation for doctor appointments
- Includes medication history, dosage changes, weight progress, side effects, nutrition averages, and injection records

### Design
- Calm pastel aesthetic (dusty rose, lavender, soft turquoise, sage)
- Clean, intuitive, non-clinical feel
- Responsive — works on mobile and desktop
- All data stored locally (private by default)

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Install & Run

```bash
cd "GLP-1 Tracker"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **PDF:** jsPDF + jspdf-autotable
- **Storage:** LocalStorage (client-side, no backend required)
- **Icons:** Lucide React

## Project Structure

```
src/
├── app/                  # Pages (dashboard, injections, nutrition, etc.)
├── components/
│   ├── charts/           # Trend charts, body map
│   ├── layout/           # Navigation, app shell
│   ├── onboarding/       # First-run setup wizard
│   └── ui/               # Buttons, cards, inputs, progress
├── hooks/                # App state, reminders
└── lib/
    ├── constants.ts      # Medications, sites, meal templates
    ├── pdf-report.ts     # PDF generation
    ├── storage.ts        # LocalStorage persistence
    ├── types.ts          # TypeScript interfaces
    └── utils.ts          # Pattern analysis, meal plans, helpers
```

## Privacy

All health data is stored locally in your browser's LocalStorage. No data is transmitted to any server. You can export a PDF report to share with your healthcare provider when you choose.

## Disclaimer

This app is for personal tracking and informational purposes only. It is not medical advice. Always consult your healthcare provider for treatment decisions.

---

Built with care for the GLP-1 community 💜
