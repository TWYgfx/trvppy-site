// scripts/convert-images.js
// Converts PNG mockups to WebP and AVIF using sharp
// Usage: node scripts/convert-images.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, '..', 'public', 'mockups');
if (!fs.existsSync(dir)) {
  console.error('mockups directory not found:', dir);
  process.exit(1);
}

(async () => {
  const files = fs.readdirSync(dir).filter((f) => /\.(png|jpg|jpeg)$/i.test(f));
  for (const file of files) {
    const infile = path.join(dir, file);
    const base = file.replace(/\.[^.]+$/, '');
    const outWebp = path.join(dir, `${base}.webp`);
    const outAvif = path.join(dir, `${base}.avif`);
    try {
      console.log('Converting', infile);
      await sharp(infile)
        .clone()
        .webp({ quality: 80 })
        .toFile(outWebp);
      await sharp(infile)
        .clone()
        .avif({ quality: 50 })
        .toFile(outAvif);
      console.log('Wrote', outWebp, outAvif);
    } catch (err) {
      console.error('Failed to convert', infile, err);
    }
  }
})();
