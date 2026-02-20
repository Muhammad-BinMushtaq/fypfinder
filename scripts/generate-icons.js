/**
 * PWA Icon Generator Script
 * 
 * Generates all required PWA icons from the SVG logo.
 * 
 * Usage:
 *   npm install sharp --save-dev
 *   node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp is not installed.');
  console.log('\nTo install, run:');
  console.log('  npm install sharp --save-dev');
  console.log('\nThen run this script again:');
  console.log('  node scripts/generate-icons.js');
  process.exit(1);
}

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');
const SVG_PATH = path.join(ICONS_DIR, 'logo.svg');

// Standard icon sizes
const STANDARD_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];

async function generateIcons() {
  // Check if SVG exists
  if (!fs.existsSync(SVG_PATH)) {
    console.error('Error: logo.svg not found in public/icons/');
    console.log('Please create logo.svg first.');
    process.exit(1);
  }

  console.log('Generating PWA icons from logo.svg...\n');

  const svgBuffer = fs.readFileSync(SVG_PATH);

  // Generate standard icons
  for (const size of STANDARD_SIZES) {
    const filename = `icon-${size}x${size}.png`;
    const outputPath = path.join(ICONS_DIR, filename);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated ${filename}`);
  }

  // Generate maskable icons (same as standard, content already has padding)
  for (const size of MASKABLE_SIZES) {
    const filename = `icon-maskable-${size}x${size}.png`;
    const outputPath = path.join(ICONS_DIR, filename);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated ${filename}`);
  }

  console.log('\n✅ All icons generated successfully!');
  console.log('\nYou can verify them in DevTools → Application → Manifest');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
