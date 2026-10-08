"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { AppData } from "./types";
import {
  formatDate,
  getDosageHistory,
  getNutritionAverages,
  getTreatmentConsistency,
  getWeightProgress,
  formatInjectionDosesSummary,
  getInjectionDoses,
  getMedicationLabel,
  getProfileInjectionDoses,
} from "./utils";
import { SIDE_EFFECTS } from "./constants";

export async function generateMedicalSummary(data: AppData): Promise<void> {
  const { profile, injections, weights, sideEffects, nutrition } = data;
  if (!profile) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFillColor(235, 177, 203);
  doc.roundedRect(14, 10, pageWidth - 28, 28, 3, 3, "F");
  doc.setTextColor(80, 60, 60);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("GLP-1 Treatment Summary", pageWidth / 2, 22, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated ${formatDate(new Date().toISOString())}`, pageWidth / 2, 30, {
    align: "center",
  });

  y = 48;
  doc.setTextColor(60, 60, 60);

  // Patient info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Information", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${profile.name}`, 14, y);
  y += 6;
  doc.text(
    `Medication: ${formatInjectionDosesSummary(getProfileInjectionDoses(profile))}`,
    14,
    y
  );
  y += 6;
  doc.text(`Treatment Start: ${formatDate(profile.startDate)}`, 14, y);
  y += 6;
  const consistency = getTreatmentConsistency(injections);
  doc.text(
    `Injection Consistency: ${consistency.percentage}% (${consistency.onTime}/${consistency.total} weeks)`,
    14,
    y
  );
  y += 12;

  // Dosage history
  const dosageHistory = getDosageHistory(injections);
  if (dosageHistory.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Dosage History", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Date", "Dosage"]],
      body: dosageHistory.map((d) => [formatDate(d.date), `${d.dosage} ${d.unit}`]),
      theme: "striped",
      headStyles: { fillColor: [196, 181, 227] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Weight progress
  const weightProgress = getWeightProgress(weights);
  if (weightProgress) {
    doc.setFont("helvetica", "bold");
    doc.text("Weight Progress", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Date", "Weight", "Change"]],
      body: weightProgress.sorted.slice(-10).map((w, i, arr) => {
        const prev = i > 0 ? arr[i - 1].weight : w.weight;
        const change = w.weight - prev;
        return [
          formatDate(w.date),
          `${w.weight} ${w.unit}`,
          i === 0 ? "—" : `${change > 0 ? "+" : ""}${change.toFixed(1)}`,
        ];
      }),
      theme: "striped",
      headStyles: { fillColor: [125, 211, 200] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // New page if needed
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // Side effects summary
  const recentEffects = sideEffects.slice(0, 14);
  if (recentEffects.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Recent Side Effects (Last 14 entries)", 14, y);
    y += 4;
    const effectRows: string[][] = [];
    for (const entry of recentEffects) {
      for (const effect of entry.effects) {
        if (effect.severity >= 2) {
          const label = SIDE_EFFECTS.find((s) => s.id === effect.type)?.label ?? effect.type;
          effectRows.push([
            formatDate(entry.date),
            label,
            ["", "Mild", "Moderate", "Significant", "Severe"][effect.severity],
          ]);
        }
      }
    }
    if (effectRows.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Date", "Symptom", "Severity"]],
        body: effectRows.slice(0, 20),
        theme: "striped",
        headStyles: { fillColor: [235, 177, 203] },
        margin: { left: 14, right: 14 },
      });
      y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    }
  }

  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // Nutrition averages
  const nutritionAvg = getNutritionAverages(nutrition, 14);
  if (nutritionAvg) {
    doc.setFont("helvetica", "bold");
    doc.text("Nutrition Averages (14-day)", 14, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.text(`Calories: ${nutritionAvg.calories} kcal/day`, 14, y);
    y += 6;
    doc.text(`Protein: ${nutritionAvg.protein}g/day`, 14, y);
    y += 6;
    doc.text(`Fiber: ${nutritionAvg.fiber}g/day`, 14, y);
    y += 6;
    doc.text(`Water: ${nutritionAvg.water} ${profile.waterUnit}/day`, 14, y);
    y += 12;
  }

  // Recent injections
  if (injections.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Recent Injections", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Date", "Medications & doses", "Site"]],
      body: injections.slice(0, 8).map((i) => [
        formatDate(i.date),
        formatInjectionDosesSummary(getInjectionDoses(i)),
        i.site.replace(/-/g, " "),
      ]),
      theme: "striped",
      headStyles: { fillColor: [159, 184, 159] },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "This report is for informational purposes. Consult your healthcare provider for medical advice.",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(`GLP1-Summary-${formatDate(new Date().toISOString(), "yyyy-MM-dd")}.pdf`);
}
