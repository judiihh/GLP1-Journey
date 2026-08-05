"use client";

import { jsPDF } from "jspdf";
import type { DailyMealPlan, UserProfile } from "./types";
import { formatDate } from "./utils";

const MEAL_LABELS: Record<DailyMealPlan["meals"][0]["mealType"], string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 20) {
    doc.addPage();
    return 20;
  }
  return y;
}

export async function generateMealPlanPdf(
  plan: DailyMealPlan,
  profile: UserProfile
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Header
  doc.setFillColor(196, 181, 227);
  doc.roundedRect(margin, 10, contentWidth, 28, 3, 3, "F");
  doc.setTextColor(60, 50, 80);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("GLP-1 Meal Plan", pageWidth / 2, 22, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${profile.name} · ${formatDate(plan.date)}`,
    pageWidth / 2,
    30,
    { align: "center" }
  );

  y = 48;
  doc.setTextColor(60, 60, 60);

  // Nutrition goals
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Your nutrition goals", margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Calories: ${profile.calorieGoal} kcal   ·   Protein: ${profile.proteinGoal}g   ·   Fiber: ${profile.fiberGoal}g`,
    margin,
    y
  );
  y += 10;

  // Plan totals
  doc.setFont("helvetica", "bold");
  doc.text("Plan totals", margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.text(
    `Calories: ${plan.totalCalories} / ${profile.calorieGoal} kcal   ·   Protein: ${plan.totalProtein}g / ${profile.proteinGoal}g   ·   Fiber: ${plan.totalFiber}g / ${profile.fiberGoal}g`,
    margin,
    y
  );
  y += 14;

  // Meals
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Meals", margin, y);
  y += 10;

  for (const meal of plan.meals) {
    y = ensureSpace(doc, y, 45);

    doc.setFillColor(245, 243, 250);
    doc.roundedRect(margin, y - 4, contentWidth, 8, 2, 2, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 100, 160);
    doc.text(MEAL_LABELS[meal.mealType].toUpperCase(), margin + 4, y + 1);
    y += 10;

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.text(meal.name, margin, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(
      `${meal.calories} kcal  ·  ${meal.protein}g protein  ·  ${meal.fiber}g fiber`,
      margin,
      y
    );
    y += 7;

    const descLines = doc.splitTextToSize(meal.description, contentWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 5 + 4;

    y = ensureSpace(doc, y, 20);
    doc.setFillColor(230, 248, 245);
    const tipLines = doc.splitTextToSize(`Tip: ${meal.tips}`, contentWidth - 8);
    const tipHeight = tipLines.length * 5 + 6;
    doc.roundedRect(margin, y - 3, contentWidth, tipHeight, 2, 2, "F");
    doc.setTextColor(50, 120, 110);
    doc.text(tipLines, margin + 4, y + 2);
    y += tipHeight + 8;
  }

  // Principles footer section
  y = ensureSpace(doc, y, 50);
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("GLP-1 meal planning reminders", margin, y);
  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const reminders = [
    "• Build meals around lean protein and eat slowly with smaller portions.",
    "• Choose gentle, cooked foods when nausea is present.",
    "• Stay hydrated between meals.",
    "• This plan is for inspiration only — consult your provider for personalized advice.",
  ];
  for (const line of reminders) {
    y = ensureSpace(doc, y, 8);
    doc.text(line, margin, y);
    y += 5;
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `GLP-1 Journey · Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(`GLP1-Meal-Plan-${formatDate(plan.date, "yyyy-MM-dd")}.pdf`);
}
