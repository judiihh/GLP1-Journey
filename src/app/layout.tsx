import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/hooks/useAppData";
import { Sidebar, MobileNav } from "@/components/layout/Navigation";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "GLP-1 Journey — Your Wellness Companion",
  description:
    "Track GLP-1 medications, nutrition, progress, side effects, and generate doctor-ready reports in one calm, supportive app.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        <AppProvider>
          <div className="flex min-h-screen bg-gradient-to-br from-cream-50 via-white to-lavender-50/20">
            <Sidebar />
            <main className="flex-1 pb-20 lg:pb-0">
              <AppShell>{children}</AppShell>
            </main>
            <MobileNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
