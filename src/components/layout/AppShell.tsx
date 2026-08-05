"use client";

import { useApp } from "@/hooks/useAppData";
import { Onboarding } from "@/components/onboarding/Onboarding";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data, isLoaded } = useApp();

  if (!isLoaded) return null;

  if (!data.profile?.onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {children}
    </div>
  );
}
