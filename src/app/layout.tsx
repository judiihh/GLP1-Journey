import type { Metadata, Viewport } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { APP_BRAND } from "@/lib/brand-icon-art";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "GLP-1 Journey — Your Wellness Companion",
  description:
    "Track GLP-1 medications, nutrition, progress, side effects, and generate doctor-ready reports in one calm, supportive app.",
  applicationName: APP_BRAND.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_BRAND.shortName,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon?id=32", sizes: "32x32", type: "image/png" },
      { url: "/icon?id=192", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: APP_BRAND.themeColor },
    { media: "(prefers-color-scheme: dark)", color: "#7358a8" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
