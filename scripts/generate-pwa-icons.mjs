import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svg = readFileSync(join(root, "public/icon.svg"));
const outDir = join(root, "public/icons");

mkdirSync(outDir, { recursive: true });

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-maskable-512.png", size: 512, padding: 0.2 },
];

for (const { name, size, padding = 0 } of sizes) {
  let pipeline = sharp(svg).resize(size, size);

  if (padding > 0) {
    const inner = Math.round(size * (1 - padding * 2));
    const inset = Math.round((size - inner) / 2);
    const innerBuf = await sharp(svg).resize(inner, inner).png().toBuffer();
    pipeline = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 196, g: 181, b: 227, alpha: 1 },
      },
    }).composite([{ input: innerBuf, left: inset, top: inset }]);
  }

  await pipeline.png().toFile(join(outDir, name));
  console.log(`Wrote public/icons/${name}`);
}
