import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public/icons");

const BRAND = {
  gradientFrom: "#c4b5e3",
  gradientTo: "#ebb1cb",
  iconScale: 0.52,
};

/** Same layout as BrandIconArt in src/lib/brand-icon-art.tsx */
function brandIconSvg(size) {
  const iconSize = Math.round(size * BRAND.iconScale);
  const offset = (size - iconSize) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${BRAND.gradientFrom}"/>
      <stop offset="100%" stop-color="${BRAND.gradientTo}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#g)"/>
  <g transform="translate(${offset} ${offset})">
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="#ffffff"/>
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </g>
</svg>`;
}

mkdirSync(outDir, { recursive: true });

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-maskable-512.png", size: 512 },
];

for (const { name, size } of sizes) {
  const svg = Buffer.from(brandIconSvg(size));
  await sharp(svg).png().toFile(join(outDir, name));
  console.log(`Wrote public/icons/${name}`);
}

writeFileSync(join(root, "public/icon.svg"), brandIconSvg(512));
console.log("Updated public/icon.svg");
