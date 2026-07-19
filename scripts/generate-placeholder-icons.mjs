/**
 * Genera los íconos PLACEHOLDER de la PWA a partir de un SVG simple con los
 * colores del brandboard (docs/02-brandboard.md). Son marcadores de posición
 * intencionales para que el manifest sea instalable desde el día uno — deben
 * reemplazarse por el ícono de marca definitivo antes de publicar la app.
 *
 * Uso: node scripts/generate-placeholder-icons.mjs
 * (script de un solo uso, no forma parte del build ni de la app en runtime)
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// `sharp` no es una dependencia directa del proyecto (llega transitiva vía
// next-pwa/workbox); se resuelve manualmente solo para este script puntual.
const sharpEntry = require.resolve("sharp", {
  paths: [path.join(process.cwd(), "node_modules/.pnpm/sharp@0.34.5/node_modules/sharp")],
});
const sharp = require(sharpEntry);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");

const GREEN = "#059669"; // Verde Caja — docs/02-brandboard.md

// Ícono simple tipo "moneda" (coin): anillo blanco grueso + barra central,
// evoca dinero/caja sin depender de texto ni fuentes externas.
function coinSvg({ size, padding }) {
  const cx = size / 2;
  const cy = size / 2;
  const ringOuter = size / 2 - padding;
  const ringInner = ringOuter * 0.62;
  const barWidth = ringOuter * 0.32;
  const barHeight = ringOuter * 1.5;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${GREEN}"/>
  <circle cx="${cx}" cy="${cy}" r="${ringOuter}" fill="none" stroke="#FFFFFF" stroke-width="${
    ringOuter - ringInner
  }"/>
  <rect x="${cx - barWidth / 2}" y="${cy - barHeight / 2}" width="${barWidth}" height="${barHeight}" rx="${
    barWidth / 2
  }" fill="#FFFFFF"/>
</svg>`.trim();
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const targets = [
    { file: "icon-192x192.png", size: 192, padding: 20 },
    { file: "icon-512x512.png", size: 512, padding: 54 },
    // Maskable: sin padding de seguridad propio (el SO recorta), el
    // contenido ya respeta la zona segura del 80% dentro del propio glyph.
    { file: "icon-512x512-maskable.png", size: 512, padding: 90 },
  ];

  for (const { file, size, padding } of targets) {
    const svg = coinSvg({ size, padding });
    const outPath = path.join(outDir, file);
    await sharp(Buffer.from(svg)).png().toFile(outPath);
    console.log("Generado:", outPath);
  }

  // Favicon simple (mismo glyph, tamaño chico) para /public/favicon.ico se
  // deja fuera de este script: Next.js sirve public/icons vía manifest, y
  // favicon.ico ya lo maneja Next con su propio default si no se sobreescribe.
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
