"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  formatDate,
  getInjectionIntervalDays,
  validateNextInjectionDate,
} from "@/lib/utils";
import type { GLP1Medication } from "@/lib/types";
import { Calendar, CheckCircle2 } from "lucide-react";

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
            className="w-full"
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
            className="w-full"
            disabled={isSaving}
            onClick={() => handleConfirm(suggestedDate, suggestedTime)}
          >
            Keep suggested schedule
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-turquoise-100 bg-gradient-to-br from-turquoise-50/90 to-lavender-50/60 p-4">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-turquoise-500" />
          <div>
            <p className="font-medium text-gray-800">Injection logged successfully</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Confirm when you&apos;d like your next injection. You can adjust the
              date or time below.
            </p>
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

        <p className="flex items-center gap-1.5 text-sm text-gray-600">
          <Calendar className="h-4 w-4 shrink-0 text-lavender-500" />
          <span>
            Next:{" "}
            <span className="font-medium text-gray-800">
              {formatDate(nextDate, "EEEE, MMM d")}
              {nextTime ? ` at ${nextTime}` : ""}
            </span>
          </span>
        </p>
      </div>
    </Modal>
  );
}
