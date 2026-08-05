"use client";

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
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useReminders } from "@/hooks/useReminders";
import { SidebarProfile } from "@/components/layout/SidebarProfile";

const navItems = [
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

export function Sidebar() {
  const pathname = usePathname();
  useReminders();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/60 backdrop-blur-md border-r border-lavender-100/50 min-h-screen p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lavender-300 to-rose-300 flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-gray-800 text-lg leading-tight">
              GLP-1 Journey
            </h1>
            <p className="text-[11px] text-lavender-400">Your wellness companion</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-lavender-100 text-lavender-600 shadow-soft"
                  : "text-gray-600 hover:bg-lavender-50 hover:text-lavender-500"
              )}
            >
              <item.icon className="w-4.5 h-4.5" size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <SidebarProfile />
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const mobileItems = navItems.slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-lg border-t border-lavender-100 z-50 safe-area-bottom">
      <div className="flex justify-around py-2 px-1">
        {mobileItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors min-w-0",
                active ? "text-lavender-600" : "text-gray-400"
              )}
            >
              <item.icon size={20} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
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
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-800">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-500 mt-1 text-sm md:text-base">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
