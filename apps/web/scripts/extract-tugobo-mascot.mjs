/**
 * Crops mascot from full Logo.png → public/tugobo-mascot.png
 * Run: pnpm --filter web exec node scripts/extract-tugobo-mascot.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const srcPath = path.join(root, "public", "Logo.png");
const outPath = path.join(root, "public", "tugobo-mascot.png");

/** Left slice of full logo: mascot only (wordmark starts just right of ~32%) */
const CROP_RATIO = 0.31;
/** Solid black backdrop → transparent (max RGB channel) */
const BLACK_CUT = 22;

async function main() {
  const meta = await sharp(srcPath).metadata();
  if (!meta.width || !meta.height) throw new Error("Could not read Logo.png dimensions");

  const cropW = Math.min(meta.width, Math.round(meta.width * CROP_RATIO));

  const { data, info } = await sharp(srcPath)
    .extract({ left: 0, top: 0, width: cropW, height: meta.height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.channels !== 4) throw new Error(`Expected RGBA raw, got ${info.channels} channels`);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    if (Math.max(r, g, b) <= BLACK_CUT) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()
    .png()
    .toFile(outPath);

  console.log("Wrote", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
