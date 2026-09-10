"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate, getInjectionIntervalDays, validateNextInjectionDate } from "@/lib/utils";
import type { GLP1Medication } from "@/lib/types";
import { Calendar, CheckCircle2 } from "lucide-react";

interface NextInjectionConfirmProps {
  medicationLabel: string;
  medication: GLP1Medication;
  suggestedDate: string;
  suggestedTime: string;
  onConfirm: (nextDate: string, nextTime: string) => Promise<void>;
  isSaving: boolean;
}

export function NextInjectionConfirm({
  medicationLabel,
  medication,
  suggestedDate,
  suggestedTime,
  onConfirm,
  isSaving,
}: NextInjectionConfirmProps) {
  const [nextDate, setNextDate] = useState(suggestedDate);
  const [nextTime, setNextTime] = useState(suggestedTime);
  const dateError = validateNextInjectionDate(nextDate) ?? undefined;

  const intervalDays = getInjectionIntervalDays(medication);

  return (
    <Card className="border-turquoise-200 bg-gradient-to-br from-turquoise-50/80 to-lavender-50/50">
      <CardHeader
        title="Confirm next injection"
        subtitle={`Based on your ${intervalDays}-day ${medicationLabel} schedule`}
      />
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/80 border border-turquoise-100">
          <CheckCircle2 className="w-5 h-5 text-turquoise-500 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700 leading-relaxed">
            Your scheduled dose is complete. Confirm when you&apos;d like your next
            injection — you can adjust the date or time below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Next injection date"
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
          />
          <Input
            label="Next injection time"
            type="time"
            value={nextTime}
            onChange={(e) => setNextTime(e.target.value)}
          />
        </div>

        {dateError && (
          <p className="text-sm text-rose-600">{dateError}</p>
        )}

        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          Next: {formatDate(nextDate, "EEEE, MMM d")}
          {nextTime ? ` at ${nextTime}` : ""}
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            className="flex-1"
            loading={isSaving}
            disabled={Boolean(dateError)}
            onClick={() => onConfirm(nextDate, nextTime)}
          >
            Confirm next injection
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onConfirm(suggestedDate, suggestedTime)}
            disabled={isSaving}
          >
            Keep suggested schedule
          </Button>
        </div>
      </div>
    </Card>
  );
}
