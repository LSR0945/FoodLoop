import { createRequire } from "node:module";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const project = path.join(root, "surplus-plate-link");
const require = createRequire(path.join(project, "package.json"));
const sharp = require("sharp");
const dir = path.join(project, "public", "images", "cards");

function targetWidth(name) {
  if (name.startsWith("avatar-")) return 160;
  if (name.startsWith("mini-")) return 400;
  if (name.startsWith("strip-")) return 900;
  if (name.startsWith("ground-")) return 900;
  if (name.startsWith("story-")) return 1000;
  return 1400;
}

const files = (await readdir(dir)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
let before = 0;
let after = 0;

for (const file of files) {
  const full = path.join(dir, file);
  const width = targetWidth(path.parse(file).name);
  const b = (await stat(full)).size;
  const tmp = full + ".tmp";
  await sharp(full)
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(tmp);
  const a = (await stat(tmp)).size;
  if (a < b) {
    const { rename } = await import("node:fs/promises");
    await rename(tmp, full);
    before += b;
    after += a;
    console.log(`${file.padEnd(16)} ${String(b).padStart(8)} -> ${String(a).padStart(7)} (w=${width})`);
  } else {
    const { unlink } = await import("node:fs/promises");
    await unlink(tmp);
    before += b;
    after += b;
    console.log(`${file.padEnd(16)} ${String(b).padStart(8)} kept`);
  }
}
console.log(`TOTAL ${before} -> ${after} bytes (saved ${before - after})`);
