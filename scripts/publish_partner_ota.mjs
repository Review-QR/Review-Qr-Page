import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const newVersion = process.argv[2] || `2.2.${Date.now().toString().slice(-4)}`;
const notes = process.argv[3] || 'Live OTA update without APK re-install';

console.log('======================================================');
console.log(`🚀 PUBLISHING LIVE PARTNER OTA BUNDLE: v${newVersion}`);
console.log('======================================================');

const rootDir = process.cwd();
const bundleDir = path.join(rootDir, 'android-embedded-bundle');
const publicBundlesDir = path.join(rootDir, 'public', 'bundles');

if (!fs.existsSync(publicBundlesDir)) {
  fs.mkdirSync(publicBundlesDir, { recursive: true });
}

// 1. Re-generate embedded bundle
console.log('📦 Preparing fresh embedded bundle...');
execSync('node scripts/prepare_embedded_bundle.mjs', { cwd: rootDir, stdio: 'inherit' });

// 2. Package current bundle into zip
const zipPath = path.join(publicBundlesDir, 'partner-bundle-latest.zip');
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

console.log('📦 Compressing android-embedded-bundle into partner-bundle-latest.zip...');
execSync(`tar -a -c -f "${zipPath}" -C "${bundleDir}" .`, { stdio: 'inherit' });

const stats = fs.statSync(zipPath);
const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`✔ Bundle compressed: ${sizeMb} MB`);

// 3. Write manifest
const manifest = {
  version: newVersion,
  minAppVersion: '2.2.0',
  bundleUrl: `https://trustitreview.com/bundles/partner-bundle-latest.zip?v=${Date.now()}`,
  updatedAt: new Date().toISOString(),
  notes: notes,
  sizeBytes: stats.size
};

const manifestPath = path.join(publicBundlesDir, 'partner-ota-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`✔ Updated OTA manifest at: ${manifestPath}`);
console.log('======================================================');
console.log(`🎉 SUCCESS: Live Partner OTA v${newVersion} is published!`);
console.log('   All installed merchant apps will automatically update on launch without APK re-install!');
console.log('======================================================');
