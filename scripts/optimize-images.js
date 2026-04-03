const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', 'assets', 'img');
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 85;
const PNG_COMPRESSION = 9;
const WEBP_QUALITY = 85;

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

async function getImageFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getImageFiles(fullPath));
    } else if (IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const webpPath = filePath + '.webp';

  // Skip if WebP already exists and is newer than source
  if (fs.existsSync(webpPath)) {
    const srcStat = fs.statSync(filePath);
    const webpStat = fs.statSync(webpPath);
    if (webpStat.mtimeMs >= srcStat.mtimeMs) {
      console.log(`  SKIP (up to date): ${path.relative(IMG_DIR, webpPath)}`);
      return;
    }
  }

  const image = sharp(filePath);
  const metadata = await image.metadata();

  // Resize if wider than MAX_WIDTH
  const resizeOpts = metadata.width > MAX_WIDTH ? { width: MAX_WIDTH } : {};

  // Optimize original in-place
  if (ext === '.jpg' || ext === '.jpeg') {
    const buffer = await image.resize(resizeOpts).jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    fs.writeFileSync(filePath, buffer);
  } else if (ext === '.png') {
    const buffer = await image.resize(resizeOpts).png({ compressionLevel: PNG_COMPRESSION }).toBuffer();
    fs.writeFileSync(filePath, buffer);
  }

  // Generate WebP variant
  await sharp(filePath).resize(resizeOpts).webp({ quality: WEBP_QUALITY }).toFile(webpPath);

  console.log(`  DONE: ${path.relative(IMG_DIR, filePath)} -> +webp`);
}

async function main() {
  console.log('Optimizing images in', IMG_DIR);

  if (!fs.existsSync(IMG_DIR)) {
    console.log('No image directory found, skipping.');
    return;
  }

  const files = await getImageFiles(IMG_DIR);
  console.log(`Found ${files.length} image(s) to process.\n`);

  for (const file of files) {
    await optimizeImage(file);
  }

  console.log('\nImage optimization complete.');
}

main().catch(err => {
  console.error('Image optimization failed:', err);
  process.exit(1);
});
