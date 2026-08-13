"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import type { NutritionLog, UserProfile } from "@/lib/types";
import { Apple, Pencil, Trash2, Check, X } from "lucide-react";

interface NutritionHistoryItemProps {
  log: NutritionLog;
  profile: UserProfile;
  onUpdate: (log: NutritionLog, previousDate: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSaving: boolean;
}

export function NutritionHistoryItem({
  log,
  profile,
  onUpdate,
  onDelete,
  isSaving,
}: NutritionHistoryItemProps) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(log.date);
  const [calories, setCalories] = useState(String(log.calories));
  const [protein, setProtein] = useState(String(log.protein));
  const [fiber, setFiber] = useState(String(log.fiber));
  const [carbs, setCarbs] = useState(String(log.carbs ?? ""));
  const [fat, setFat] = useState(String(log.fat ?? ""));
  const [water, setWater] = useState(String(log.water));
  const [notes, setNotes] = useState(log.notes ?? "");

  const resetForm = () => {
    setDate(log.date);
    setCalories(String(log.calories));
    setProtein(String(log.protein));
    setFiber(String(log.fiber));
    setCarbs(String(log.carbs ?? ""));
    setFat(String(log.fat ?? ""));
    setWater(String(log.water));
    setNotes(log.notes ?? "");
  };

  const handleSave = async () => {
    await onUpdate(
      {
        ...log,
        date,
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        fiber: parseInt(fiber) || 0,
        carbs: parseInt(carbs) || undefined,
        fat: parseInt(fat) || undefined,
        water: parseInt(water) || 0,
        notes: notes || undefined,
      },
      log.date
    );
    setEditing(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Delete nutrition log from ${formatDate(log.date)} (${log.calories} kcal)?`
      )
    ) {
      return;
    }
    await onDelete(log.id);
  };

  const handleCancel = () => {
    resetForm();
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="p-4 rounded-xl bg-white border-2 border-lavender-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-800">Edit nutrition log</p>
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cancel edit"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Calories"
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
          <Input
            label="Protein (g)"
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
          />
          <Input
            label="Fiber (g)"
            type="number"
            value={fiber}
            onChange={(e) => setFiber(e.target.value)}
          />
          <Input
            label="Carbs (g)"
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
          />
          <Input
            label="Fat (g)"
            type="number"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
          />
          <Input
            label={`Water (${profile.waterUnit})`}
            type="number"
            value={water}
            onChange={(e) => setWater(e.target.value)}
          />
        </div>

        <Textarea
          label="Notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you eat? How was your appetite?"
        />

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleSave}
            loading={isSaving}
            className="flex-1"
          >
            <Check className="w-4 h-4" /> Save changes
          </Button>
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-gradient-to-r from-lavender-50/60 to-rose-50/50 group border border-rose-100/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
            <Apple className="w-5 h-5 text-lavender-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-gray-800">
              {log.calories} kcal · {log.protein}g protein
              {log.mealBreakdown && (
                <span className="ml-2 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-lavender-100 text-lavender-600">
                  AI est.
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(log.date)} · {log.fiber}g fiber
              {(log.carbs != null || log.fat != null) && (
                <>
                  {" "}
                  · {log.carbs ?? 0}g carbs · {log.fat ?? 0}g fat
                </>
              )}{" "}
              · {log.water} {profile.waterUnit} water
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="p-2 rounded-lg text-lavender-500 hover:bg-lavender-100 transition-colors touch-manipulation"
            aria-label="Edit nutrition log"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving}
            className="p-2 rounded-lg text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-colors disabled:opacity-50 touch-manipulation"
            aria-label="Delete nutrition log"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {log.mealBreakdown && log.mealBreakdown.items.length > 0 && (
        <div className="mt-2 ml-[52px] space-y-1">
          {log.mealBreakdown.items.slice(0, 4).map((item) => (
            <p key={item.id} className="text-[11px] text-gray-500">
              ~{item.calories} kcal · {item.name} ({item.portion})
            </p>
          ))}
          {log.mealBreakdown.items.length > 4 && (
            <p className="text-[11px] text-gray-400">
              +{log.mealBreakdown.items.length - 4} more items
            </p>
          )}
        </div>
      )}

      {log.notes && (
        <p className="text-xs text-gray-400 mt-2 ml-[52px] break-words whitespace-pre-wrap leading-relaxed">
          {log.notes}
        </p>
      )}
    </div>
  );
}
