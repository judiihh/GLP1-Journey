import type { MetadataRoute } from "next";
import { APP_BRAND } from "@/lib/brand-icon-art";

export default function manifest(): MetadataRoute.Manifest {
  return {
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
        src: "/icon?id=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon?id=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon?id=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
