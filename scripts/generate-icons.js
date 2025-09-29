const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const srcDir = path.join(__dirname, '..', 'public', 'icons');
const outDir = srcDir;

if (!fs.existsSync(srcDir)) {
  console.error('Source icons directory not found:', srcDir);
  process.exit(1);
}

const srcFile = ['icon-512.png','icon-512-maskable.png','icon-192.png'].map(f => path.join(srcDir,f)).find(fs.existsSync);
if (!srcFile) {
  console.error('No source icon found in public/icons. Place icon-512.png or icon-192.png');
  process.exit(1);
}

(async () => {
  try {
    for (const size of sizes) {
      const out = path.join(outDir, `icon-${size}.png`);
      if (path.resolve(out) === path.resolve(srcFile)) {
        console.log('Skipping resize for same input/output', out);
        continue;
      }
      await sharp(srcFile).resize(size, size).png({ quality: 90 }).toFile(out);
      console.log('Written', out);
    }

    // create a maskable 512 if maskable source exists
    const maskSrc = path.join(srcDir, 'icon-512-maskable.png');
    if (fs.existsSync(maskSrc)) {
      await sharp(maskSrc).resize(512,512).png({ quality: 90 }).toFile(path.join(outDir, 'icon-512-maskable.png'));
      console.log('Written maskable', path.join(outDir, 'icon-512-maskable.png'));
    }

    console.log('Icon generation complete.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
