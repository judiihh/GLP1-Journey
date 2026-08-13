/** Shared brand icon art for favicons, Apple Touch Icon, and PWA manifest assets. */

export const APP_BRAND = {
  name: "GLP-1 Journey",
  shortName: "GLP-1 Journey",
  themeColor: "#a892d4",
  backgroundColor: "#fdf8fb",
  gradientFrom: "#c4b5e3",
  gradientTo: "#ebb1cb",
} as const;

export function BrandIconArt({ size }: { size: number }) {
  const iconSize = Math.round(size * 0.52);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${APP_BRAND.gradientFrom} 0%, ${APP_BRAND.gradientTo} 100%)`,
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          fill="#ffffff"
        />
        <path
          d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
