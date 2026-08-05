"use client";

import { useApp } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data, isLoaded, error } = useApp();
  const { user, loading: authLoading } = useAuth();

  if (!isLoaded || authLoading) return null;

  if (isSupabaseConfigured() && !user) {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          Supabase is not configured. Copy <code className="bg-white/60 px-1 rounded">.env.local.example</code> to{" "}
          <code className="bg-white/60 px-1 rounded">.env.local</code> and add your project URL and anon key.
          Running in local-only mode until then.
        </div>
        {!data.profile?.onboardingComplete ? <Onboarding /> : children}
      </div>
    );
  }

  if (!data.profile?.onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {error}
        </div>
      )}
      {children}
    </div>
  );
}
