"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Syringe,
  Apple,
  TrendingUp,
  HeartPulse,
  UtensilsCrossed,
  FileText,
  Settings,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useReminders } from "@/hooks/useReminders";
import { SidebarProfile } from "@/components/layout/SidebarProfile";
import { ui } from "@/lib/ui-classes";

export const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/injections", label: "Injections", icon: Syringe },
  { href: "/nutrition", label: "Nutrition", icon: Apple },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/symptoms", label: "Symptoms", icon: HeartPulse },
  { href: "/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/report", label: "Report", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "rounded-xl bg-gradient-to-br from-lavender-300 to-rose-300 flex items-center justify-center shrink-0",
          compact ? "w-8 h-8" : "w-9 h-9"
        )}
      >
        <HeartPulse className={cn("text-white", compact ? "w-4 h-4" : "w-5 h-5")} />
      </div>
      <div className="min-w-0">
        <h1
          className={cn(
            "font-display font-bold text-gray-800 leading-tight truncate",
            compact ? "text-base" : "text-lg"
          )}
        >
          GLP-1 Journey
        </h1>
        {!compact && (
          <p className="text-[11px] text-lavender-400">Your wellness companion</p>
        )}
      </div>
    </div>
  );
}

function NavLinks({
  onNavigate,
  mobile,
}: {
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-1", mobile && "py-1")}>
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl font-medium transition-all",
              mobile ? "px-4 py-3.5 text-base" : "px-3 py-2.5 text-sm",
              active ? ui.activeNav : ui.navIdle
            )}
          >
            <item.icon size={mobile ? 20 : 18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  useReminders();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white/60 backdrop-blur-md border-r border-lavender-100/50 sticky top-0 h-screen overflow-y-auto p-6">
      <div className="mb-8">
        <Brand />
      </div>

      <NavLinks />

      <SidebarProfile />
    </aside>
  );
}

export function MobileHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-lavender-100/80 safe-area-top">
      <div className="flex items-center gap-3 px-4 h-14 max-w-full">
        <button
          type="button"
          onClick={onMenuOpen}
          className="p-2.5 -ml-1 rounded-xl text-gray-700 hover:bg-lavender-50 active:bg-lavender-100 transition-colors touch-manipulation"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Brand compact />
      </div>
    </header>
  );
}

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close menu"
      />

      <aside
        className="absolute inset-y-0 left-0 w-[min(88vw,320px)] flex flex-col bg-white shadow-2xl animate-slide-in-left safe-area-top safe-area-bottom"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between gap-3 p-4 border-b border-lavender-100 shrink-0">
          <Brand compact />
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl text-gray-500 hover:bg-lavender-50 active:bg-lavender-100 transition-colors touch-manipulation"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          <NavLinks onNavigate={onClose} mobile />
        </div>

        <div className="shrink-0 p-4 border-t border-lavender-100 bg-lavender-50/30">
          <SidebarProfile embedded />
        </div>
      </aside>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-800 break-words">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-500 mt-1 text-sm md:text-base">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="shrink-0 w-full sm:w-auto flex flex-wrap gap-2 sm:justify-end">
          {action}
        </div>
      )}
    </div>
  );
}
