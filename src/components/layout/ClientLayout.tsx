"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/hooks/useAuth";
import { AppProvider } from "@/hooks/useAppData";
import { Sidebar, MobileNav } from "@/components/layout/Navigation";
import { AppShell } from "@/components/layout/AppShell";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <AuthProvider>
        <AppProvider>{children}</AppProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <AppProvider>
        <div className="flex min-h-screen bg-gradient-to-br from-cream-50 via-white to-lavender-50/20">
          <Sidebar />
          <main className="flex-1 pb-20 lg:pb-0">
            <AppShell>{children}</AppShell>
          </main>
          <MobileNav />
        </div>
      </AppProvider>
    </AuthProvider>
  );
}
