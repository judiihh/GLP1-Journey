import { ImageResponse } from "next/og";
import { BrandIconArt } from "@/lib/brand-icon-art";

export const contentType = "image/png";

export function generateImageMetadata() {
  return [
    {
      contentType: "image/png" as const,
      size: { width: 32, height: 32 },
      id: "32",
    },
    {
      contentType: "image/png" as const,
      size: { width: 192, height: 192 },
      id: "192",
    },
    {
      contentType: "image/png" as const,
      size: { width: 512, height: 512 },
      id: "512",
    },
  ];
}

export default async function Icon({
  id,
}: {
  id: Promise<string | undefined>;
}) {
  const iconId = (await id) ?? "32";
  const size = iconId === "512" ? 512 : iconId === "192" ? 192 : 32;

  return new ImageResponse(<BrandIconArt size={size} />, {
    width: size,
    height: size,
  });
}
