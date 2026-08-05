"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Settings } from "lucide-react";
import { cn } from "@/lib/cn";
import { useApp } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { getMedicationLabel } from "@/lib/utils";
import { ui } from "@/lib/ui-classes";

function getInitials(name: string, email?: string | null): string {
  const trimmed = name.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

export function SidebarProfile() {
  const pathname = usePathname();
  const { data } = useApp();
  const { user } = useAuth();
  const { profile } = data;

  const displayName =
    profile?.name?.trim() ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Friend";

  const initials = getInitials(profile?.name ?? "", user?.email);
  const isSettings = pathname === "/settings";
  const hasMedication = profile?.medication && profile.onboardingComplete;

  return (
    <div className="mt-auto pt-6 border-t border-lavender-100 space-y-3">
      <Link
        href="/settings"
        className={cn(
          "block p-3 rounded-2xl transition-all group",
          isSettings ? ui.activeCard : "bg-white/70 hover:bg-lavender-50 hover:shadow-soft"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender-400 to-rose-300 flex items-center justify-center shrink-0 shadow-soft">
            <span className="text-sm font-semibold text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-800 truncate">
              {displayName}
            </p>
            {hasMedication ? (
              <p className="text-[11px] text-lavender-500 truncate mt-0.5">
                {getMedicationLabel(profile.medication)} · {profile.currentDosage}
                {profile.dosageUnit}
              </p>
            ) : (
              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                Complete setup to get started
              </p>
            )}
          </div>
          <ChevronRight
            className={cn(
              "w-4 h-4 shrink-0 transition-transform",
              isSettings ? "text-lavender-500" : "text-gray-300 group-hover:text-lavender-400 group-hover:translate-x-0.5"
            )}
          />
        </div>
        <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-lavender-100/80">
          <Settings className="w-3 h-3 text-lavender-400" />
          <span className="text-[10px] text-lavender-500 font-medium">
            View profile & settings
          </span>
        </div>
      </Link>

      <p className="text-[10px] text-gray-400 text-center leading-relaxed px-1">
        {`You're doing great. 💜 One day at a time.`}
      </p>
    </div>
  );
}
