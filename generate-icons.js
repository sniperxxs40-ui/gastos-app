const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, 'public', 'logo.png');
const outputDir = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  const sizes = [192, 512];
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    await sharp(inputPath)
      .resize(size, size, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
      .png()
      .toFile(outputPath);
    console.log(`Generated: ${outputPath}`);
  }
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
