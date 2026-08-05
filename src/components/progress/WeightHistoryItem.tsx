"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import type { WeightLog } from "@/lib/types";
import { Scale, Pencil, Trash2, Check, X } from "lucide-react";

interface WeightHistoryItemProps {
  log: WeightLog;
  onUpdate: (log: WeightLog) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSaving: boolean;
}

export function WeightHistoryItem({
  log,
  onUpdate,
  onDelete,
  isSaving,
}: WeightHistoryItemProps) {
  const [editing, setEditing] = useState(false);
  const [weight, setWeight] = useState(String(log.weight));
  const [date, setDate] = useState(log.date);
  const [notes, setNotes] = useState(log.notes ?? "");

  const resetForm = () => {
    setWeight(String(log.weight));
    setDate(log.date);
    setNotes(log.notes ?? "");
  };

  const handleSave = async () => {
    await onUpdate({
      ...log,
      date,
      weight: parseFloat(weight),
      notes: notes || undefined,
    });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Delete this weight entry from ${formatDate(log.date)} (${log.weight} ${log.unit})?`
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
          <p className="text-sm font-medium text-gray-800">Edit weight entry</p>
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cancel edit"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={`Weight (${log.unit})`}
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <Textarea
          label="Notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
    <div className="p-3 rounded-xl bg-lavender-50/50 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-lavender-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-gray-800">
              {log.weight} {log.unit}
            </p>
            <p className="text-xs text-gray-500">{formatDate(log.date)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="p-2 rounded-lg text-lavender-500 hover:bg-lavender-100 transition-colors touch-manipulation"
            aria-label="Edit weight entry"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving}
            className="p-2 rounded-lg text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-colors disabled:opacity-50 touch-manipulation"
            aria-label="Delete weight entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {log.notes && (
        <p className="text-xs text-gray-400 mt-2 ml-[52px] break-words whitespace-pre-wrap leading-relaxed">
          {log.notes}
        </p>
      )}
    </div>
  );
}
