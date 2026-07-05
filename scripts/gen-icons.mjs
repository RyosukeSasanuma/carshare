import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const iconsDir = join(pub, "icons");
const appDir = join(root, "src", "app");

const BG = "#0a0a0c";
const GOLD = "#c8a45c";
const GOLD2 = "#d9b874";
const FG = "#f4f2ec";

// size: canvas px, safe: fraction of content area used (for maskable padding)
function svg({ size, safe = 1, rounded = 0, bg = BG }) {
  const s = size;
  const cx = s / 2;
  // Monogram "ND" scaled to safe area
  const fontMain = Math.round(s * 0.30 * safe);
  const fontSub = Math.round(s * 0.075 * safe);
  const yMain = Math.round(s * 0.52);
  const ySub = Math.round(s * 0.74);
  const ringR = Math.round(s * 0.44 * safe);
  const bgRect =
    rounded > 0
      ? `<rect width="${s}" height="${s}" rx="${rounded}" ry="${rounded}" fill="${bg}"/>`
      : `<rect width="${s}" height="${s}" fill="${bg}"/>`;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${GOLD2}"/>
      <stop offset="1" stop-color="${GOLD}"/>
    </linearGradient>
  </defs>
  ${bgRect}
  <circle cx="${cx}" cy="${cx}" r="${ringR}" fill="none" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="${Math.max(1, Math.round(s * 0.008))}"/>
  <text x="${cx}" y="${yMain}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="600" font-size="${fontMain}" fill="url(#g)" letter-spacing="${Math.round(s * 0.01)}">ND</text>
  <text x="${cx}" y="${ySub}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSub}" fill="${FG}" letter-spacing="${Math.round(s * 0.03)}">NOBLE DRIVE</text>
</svg>`);
}

async function render(buf, size, outPath) {
  await sharp(buf, { density: 384 }).resize(size, size).png().toFile(outPath);
  console.log("wrote", outPath);
}

await mkdir(iconsDir, { recursive: true });

// Manifest icons (transparent-safe on dark bg)
await render(svg({ size: 192 }), 192, join(iconsDir, "icon-192.png"));
await render(svg({ size: 512 }), 512, join(iconsDir, "icon-512.png"));
// Maskable: extra padding so content stays inside safe zone, full-bleed bg
await render(svg({ size: 512, safe: 0.7 }), 512, join(iconsDir, "icon-maskable-512.png"));

// App conventions: favicon-ish icon + apple touch icon (opaque bg)
await render(svg({ size: 256 }), 256, join(appDir, "icon.png"));
await render(svg({ size: 180 }), 180, join(appDir, "apple-icon.png"));

console.log("done");
