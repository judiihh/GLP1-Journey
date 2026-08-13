import type { MetadataRoute } from "next";
import { APP_BRAND } from "@/lib/brand-icon-art";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: APP_BRAND.name,
    short_name: APP_BRAND.shortName,
    description:
      "Track GLP-1 medications, nutrition, progress, side effects, and generate doctor-ready reports.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: APP_BRAND.backgroundColor,
    theme_color: APP_BRAND.themeColor,
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
