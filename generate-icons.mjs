// Script to generate Android launcher icons from the FoodLoop logo
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logo = path.join(__dirname, "public", "foodloop-logo.png");
const androidRes = path.join(__dirname, "android", "app", "src", "main", "res");

// Android mipmap sizes for launcher icons
const sizes = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

// Foreground sizes for adaptive icons (108dp, with safe zone padding)
const fgSizes = {
  "mipmap-mdpi": 108,
  "mipmap-hdpi": 162,
  "mipmap-xhdpi": 216,
  "mipmap-xxhdpi": 324,
  "mipmap-xxxhdpi": 432,
};

async function generate() {
  for (const [folder, size] of Object.entries(sizes)) {
    const dir = path.join(androidRes, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // ic_launcher.png — square icon
    await sharp(logo)
      .resize(size, size, { fit: "contain", background: { r: 248, g: 245, b: 237, alpha: 1 } })
      .png()
      .toFile(path.join(dir, "ic_launcher.png"));

    // ic_launcher_round.png — round icon (circular crop)
    const roundBuf = await sharp(logo)
      .resize(size, size, { fit: "contain", background: { r: 248, g: 245, b: 237, alpha: 1 } })
      .png()
      .toBuffer();

    // Create circular mask
    const circle = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`
    );

    await sharp(roundBuf)
      .composite([{ input: circle, blend: "dest-in" }])
      .png()
      .toFile(path.join(dir, "ic_launcher_round.png"));

    console.log(`✅ ${folder}: ${size}x${size}`);
  }

  // Generate foreground icons for adaptive icons
  for (const [folder, size] of Object.entries(fgSizes)) {
    const dir = path.join(androidRes, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // ic_launcher_foreground.png — logo centered with padding for safe zone
    const logoSize = Math.round(size * 0.65); // 65% of the foreground to stay in safe zone
    await sharp(logo)
      .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: Math.round((size - logoSize) / 2),
        bottom: Math.ceil((size - logoSize) / 2),
        left: Math.round((size - logoSize) / 2),
        right: Math.ceil((size - logoSize) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(path.join(dir, "ic_launcher_foreground.png"));

    console.log(`✅ ${folder} foreground: ${size}x${size}`);
  }

  // Generate web favicon (32x32 PNG)
  await sharp(logo)
    .resize(32, 32, { fit: "contain", background: { r: 248, g: 245, b: 237, alpha: 1 } })
    .png()
    .toFile(path.join(__dirname, "public", "favicon-32.png"));

  // Generate 192x192 PWA icon
  await sharp(logo)
    .resize(192, 192, { fit: "contain", background: { r: 248, g: 245, b: 237, alpha: 1 } })
    .png()
    .toFile(path.join(__dirname, "public", "icon-192.png"));

  // Generate 512x512 PWA icon
  await sharp(logo)
    .resize(512, 512, { fit: "contain", background: { r: 248, g: 245, b: 237, alpha: 1 } })
    .png()
    .toFile(path.join(__dirname, "public", "icon-512.png"));

  console.log("\n🎉 All icons generated successfully!");
}

generate().catch(console.error);
