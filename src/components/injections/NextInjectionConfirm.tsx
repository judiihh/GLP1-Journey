"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  formatDate,
  formatTimeDisplay,
  getInjectionIntervalDays,
  validateNextInjectionDate,
} from "@/lib/utils";
import type { GLP1Medication } from "@/lib/types";
import { Calendar, CheckCircle2, Sparkles } from "lucide-react";

interface NextInjectionConfirmProps {
  open: boolean;
  medicationLabel: string;
  medication: GLP1Medication;
  suggestedDate: string;
  suggestedTime: string;
  onConfirm: (nextDate: string, nextTime: string) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}

export function NextInjectionConfirm({
  open,
  medicationLabel,
  medication,
  suggestedDate,
  suggestedTime,
  onConfirm,
  onClose,
  isSaving,
}: NextInjectionConfirmProps) {
  const [nextDate, setNextDate] = useState(suggestedDate);
  const [nextTime, setNextTime] = useState(suggestedTime);
  const dateError = validateNextInjectionDate(nextDate) ?? undefined;

  const intervalDays = getInjectionIntervalDays(medication);

  useEffect(() => {
    if (open) {
      setNextDate(suggestedDate);
      setNextTime(suggestedTime);
    }
  }, [open, suggestedDate, suggestedTime]);

  const handleConfirm = async (date: string, time: string) => {
    await onConfirm(date, time);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      preventClose={isSaving}
      title="Schedule next injection"
      subtitle={`Based on your ${intervalDays}-day ${medicationLabel} schedule`}
      ariaLabel="Schedule next injection"
      footer={
        <div className="flex flex-col gap-2.5">
          <Button
            type="button"
            size="lg"
            className="w-full shadow-soft"
            loading={isSaving}
            disabled={Boolean(dateError)}
            onClick={() => handleConfirm(nextDate, nextTime)}
          >
            Schedule next injection
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full text-gray-500"
            disabled={isSaving}
            onClick={() => handleConfirm(suggestedDate, suggestedTime)}
          >
            Keep suggested schedule
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-2xl border border-turquoise-100/80 bg-gradient-to-br from-turquoise-50 via-white to-lavender-50/80 p-4 shadow-sm">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-turquoise-200/30 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-turquoise-100/80 ring-4 ring-turquoise-50">
              <CheckCircle2 className="h-5 w-5 text-turquoise-600" />
            </div>
            <div>
              <p className="font-display font-semibold text-gray-800">
                Injection logged successfully
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                Confirm when you&apos;d like your next injection. You can adjust
                the date or time below.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        {dateError && <p className="text-sm text-rose-600">{dateError}</p>}

        <div className="rounded-2xl border border-lavender-100/80 bg-gradient-to-r from-lavender-50/70 to-rose-50/50 px-4 py-3.5">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-lavender-500">
            <Sparkles className="h-3.5 w-3.5" />
            Upcoming dose
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="h-4 w-4 shrink-0 text-rose-400" />
            <span>
              <span className="font-display font-semibold text-gray-800">
                {formatDate(nextDate, "EEEE, MMM d")}
              </span>
              {nextTime ? (
                <span className="text-gray-600">{` at ${formatTimeDisplay(nextTime)}`}</span>
              ) : null}
            </span>
          </p>
        </div>
      </div>
    </Modal>
  );
}
