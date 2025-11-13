#!/usr/bin/env bun
/**
 * Generate PNG icons from SVG sources
 * Requires: bun add -d sharp
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function generateIcons() {
  try {
    // Try to import sharp
    const sharp = await import('sharp');

    const publicDir = join(import.meta.dir, '../docs/public');

    // Generate OG image (1200x630)
    const ogSvg = await readFile(join(publicDir, 'og-image.svg'));
    await sharp.default(ogSvg)
      .resize(1200, 630)
      .png()
      .toFile(join(publicDir, 'og-image.png'));
    console.log('✓ Generated og-image.png');

    // Generate favicon (32x32)
    const logoSvg = await readFile(join(publicDir, 'logo.svg'));
    await sharp.default(logoSvg)
      .resize(32, 32)
      .png()
      .toFile(join(publicDir, 'favicon-32x32.png'));
    console.log('✓ Generated favicon-32x32.png');

    // Generate favicon (16x16)
    await sharp.default(logoSvg)
      .resize(16, 16)
      .png()
      .toFile(join(publicDir, 'favicon-16x16.png'));
    console.log('✓ Generated favicon-16x16.png');

    // Generate apple-touch-icon (180x180)
    await sharp.default(logoSvg)
      .resize(180, 180)
      .png()
      .toFile(join(publicDir, 'apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png');

    // Generate various sizes for PWA
    const sizes = [192, 512];
    for (const size of sizes) {
      await sharp.default(logoSvg)
        .resize(size, size)
        .png()
        .toFile(join(publicDir, `icon-${size}x${size}.png`));
      console.log(`✓ Generated icon-${size}x${size}.png`);
    }

    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    if ((error as any).code === 'ERR_MODULE_NOT_FOUND') {
      console.error('❌ Error: sharp is not installed');
      console.log('\nPlease run: bun add -d sharp');
      console.log('Then run this script again: bun scripts/generate-icons.ts');
      process.exit(1);
    }
    throw error;
  }
}

generateIcons();
