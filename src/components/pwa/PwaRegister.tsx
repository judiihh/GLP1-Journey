"use client";

import { useEffect } from "react";

const SW_MIGRATION_KEY = "glp1-sw-migration-v3";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => registration.update().catch(() => {}))
        .catch(() => {
          // PWA install is optional.
        });
    };

    // One-time cleanup for older service workers that intercepted requests and broke the app.
    if (!localStorage.getItem(SW_MIGRATION_KEY)) {
      navigator.serviceWorker
        .getRegistrations()
        .then(async (registrations) => {
          await Promise.all(registrations.map((registration) => registration.unregister()));
          localStorage.setItem(SW_MIGRATION_KEY, "1");
          if (navigator.serviceWorker.controller) {
            window.location.reload();
            return;
          }
          register();
        })
        .catch(register);
      return;
    }

    register();
  }, []);

  return null;
}
