"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/hooks/useAppData";
import { getDaysUntilInjection, getMedicationLabel, formatDate } from "@/lib/utils";
import { isReminderSoundEnabled, playReminderChime } from "@/lib/reminder-sound";

/**
 * Android (Chrome and Samsung Internet) throws on `new Notification()` — notifications
 * must come from a service worker registration. Desktop supports both.
 */
async function showReminderNotification(
  title: string,
  options: NotificationOptions
): Promise<void> {
  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(title, options);
        return;
      }
    }
  } catch {
    // Fall through to the constructor below.
  }

  try {
    new Notification(title, options);
  } catch {
    // Notifications unavailable on this device — the in-app reminder still shows.
  }
}

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

    const notify = () => {
      // Marked up front so a failed notification can't retry on every re-render.
      notifiedRef.current = key;

      const med = getMedicationLabel(data.profile!.medication);
      const dateLabel = data.profile!.nextInjectionDate
        ? formatDate(data.profile!.nextInjectionDate)
        : "your scheduled day";

      void showReminderNotification("Injection Reminder 💜", {
        body:
          daysUntil === 0
            ? `Today is your ${med} injection day!`
            : `Your ${med} injection is in ${daysUntil} day${daysUntil > 1 ? "s" : ""} (${dateLabel}).`,
        icon: "/icons/icon-192.png",
      });

      if (isReminderSoundEnabled()) {
        void playReminderChime();
      }
    };

    try {
      if (Notification.permission === "granted") {
        notify();
      } else if (Notification.permission !== "denied") {
        void Notification.requestPermission()
          .then((perm) => {
            if (perm === "granted") notify();
          })
          .catch(() => {
            // Permission prompt unavailable — skip silently.
          });
      }
    } catch {
      // Notification API unusable on this device — never break the app shell.
    }
  }, [data]);
}

export function requestNotificationPermission() {
  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.requestPermission();
  }
  return Promise.resolve("denied" as NotificationPermission);
}
