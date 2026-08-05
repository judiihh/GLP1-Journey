"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/hooks/useAuth";
import { AppProvider } from "@/hooks/useAppData";
import { Sidebar, MobileHeader, MobileMenu } from "@/components/layout/Navigation";
import { AppShell } from "@/components/layout/AppShell";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

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
        <div className="flex min-h-screen min-h-[100dvh] bg-gradient-to-br from-cream-50 via-white to-lavender-50/20 overflow-x-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 w-full">
            <MobileHeader onMenuOpen={() => setMenuOpen(true)} />
            <main className="flex-1 min-w-0 overflow-x-hidden">
              <AppShell>{children}</AppShell>
            </main>
          </div>
          <MobileMenu open={menuOpen} onClose={closeMenu} />
        </div>
      </AppProvider>
    </AuthProvider>
  );
}
