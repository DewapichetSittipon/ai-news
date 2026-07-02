// One-off icon generator for the PWA. Draws a chunky 8-bit "A" (AI News) in the
// NES coin-yellow on the app's bg, matching the pixel aesthetic (ADR/theme in
// src/index.css). Emits raw PNGs with a tiny built-in encoder so we need no
// native image deps. Re-run with `node scripts/generate-icons.mjs` if the mark
// or palette changes.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
mkdirSync(OUT, { recursive: true });

// NES palette (must match src/index.css @theme tokens).
const BG = [11, 11, 26, 255]; //  #0b0b1a
const COIN = [247, 213, 29, 255]; // #f7d51d
const T = [0, 0, 0, 0]; // transparent

// 16×16 pixel-art "A". '.' = transparent, 'Y' = coin, 'B' = bg fill.
const ART = [
  "................",
  "................",
  ".....YYYYYY.....",
  "....YYYYYYYY....",
  "....YYY..YYY....",
  "...YYY....YYY...",
  "...YYY....YYY...",
  "...YYYYYYYYYY...",
  "...YYYYYYYYYY...",
  "...YYY....YYY...",
  "...YYY....YYY...",
  "...YYY....YYY...",
  "...YYY....YYY...",
  "................",
  "................",
  "................",
];
const COLORS = { ".": T, Y: COIN, B: BG };

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // 10-12 compression/filter/interlace default 0
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // no filter
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Render the 16×16 grid to `size`px. `pad` cells of margin are added around the
// art (used to keep the maskable icon inside its safe zone), and `fill` paints
// the whole canvas (bg for maskable/apple, transparent otherwise).
function render(size, { pad = 0, fill = null } = {}) {
  const grid = 16 + pad * 2;
  const cell = size / grid;
  const rgba = Buffer.alloc(size * size * 4);
  const put = (x, y, [r, g, b, a]) => {
    const i = (y * size + x) * 4;
    rgba[i] = r;
    rgba[i + 1] = g;
    rgba[i + 2] = b;
    rgba[i + 3] = a;
  };
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const gx = Math.floor(x / cell) - pad;
      const gy = Math.floor(y / cell) - pad;
      let col = fill || T;
      if (gy >= 0 && gy < 16 && gx >= 0 && gx < 16) {
        const ch = ART[gy][gx];
        if (ch !== ".") col = COLORS[ch];
        else if (fill) col = fill;
      }
      put(x, y, col);
    }
  return encodePng(size, size, rgba);
}

const files = {
  "pwa-192x192.png": render(192),
  "pwa-512x512.png": render(512),
  // Maskable: full-bleed bg + art padded into the safe zone.
  "maskable-512x512.png": render(512, { pad: 3, fill: BG }),
  // iOS home-screen icon is not masked, so give it its own opaque bg.
  "apple-touch-icon.png": render(180, { fill: BG }),
};
for (const [name, buf] of Object.entries(files)) {
  writeFileSync(join(OUT, name), buf);
  console.log(`wrote public/${name} (${buf.length} bytes)`);
}
