"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/hooks/useAppData";
import { getDaysUntilInjection, getMedicationLabel } from "@/lib/utils";
import { DAYS_OF_WEEK } from "@/lib/constants";

export function useReminders() {
  const { data } = useApp();
  const notifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!data.profile || !data.reminders.enabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const daysUntil = getDaysUntilInjection(data.profile, data.injections);
    if (daysUntil === null) return;

    const shouldNotify =
      daysUntil <= data.reminders.daysBefore && daysUntil >= 0;

    if (!shouldNotify) return;

    const key = `reminder-${daysUntil}-${new Date().toDateString()}`;
    if (notifiedRef.current === key) return;

    const showNotification = () => {
      const med = getMedicationLabel(data.profile!.medication);
      const dayName = DAYS_OF_WEEK[data.profile!.injectionDay];
      new Notification("Injection Reminder 💜", {
        body:
          daysUntil === 0
            ? `Today is your ${med} injection day!`
            : `Your ${med} injection is in ${daysUntil} day${daysUntil > 1 ? "s" : ""} (${dayName}).`,
        icon: "/icon.svg",
      });
      notifiedRef.current = key;
    };

    if (Notification.permission === "granted") {
      showNotification();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") showNotification();
      });
    }
  }, [data]);
}

export function requestNotificationPermission() {
  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.requestPermission();
  }
  return Promise.resolve("denied" as NotificationPermission);
}
