import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const outputApkSrc = path.join(rootDir, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
const downloadsDir = path.join(rootDir, 'public', 'downloads');
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

const destDownload = path.join(downloadsDir, 'Trustit-Merchant-Partner.apk');
const destPublic = path.join(rootDir, 'public', 'trustit-partner.apk');

fs.copyFileSync(outputApkSrc, destDownload);
fs.copyFileSync(outputApkSrc, destPublic);

const stats = fs.statSync(destDownload);
console.log(`✔ APK copied: ${destDownload} (${(stats.size / (1024 * 1024)).toFixed(2)} MB, ${stats.size} bytes)`);

// Prepare embedded bundle
const bundleDir = path.join(rootDir, 'android-embedded-bundle');
const partnerHtmlSrc = path.join(rootDir, '.next', 'server', 'app', 'partner.html');
if (fs.existsSync(partnerHtmlSrc)) {
  let html = fs.readFileSync(partnerHtmlSrc, 'utf8');
  fs.writeFileSync(path.join(bundleDir, 'index.html'), html);
}

// Package Live OTA Bundle
const publicBundlesDir = path.join(rootDir, 'public', 'bundles');
if (!fs.existsSync(publicBundlesDir)) fs.mkdirSync(publicBundlesDir, { recursive: true });

const zipPath = path.join(publicBundlesDir, 'partner-bundle-latest.zip');
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

execSync(`tar -a -c -f "${zipPath}" *`, { cwd: bundleDir, stdio: 'inherit' });

const otaStats = fs.statSync(zipPath);
const manifest = {
  version: '3.5.0',
  minAppVersion: '2.2.0',
  bundleUrl: `https://trustitreview.com/bundles/partner-bundle-latest.zip?v=${Date.now()}`,
  updatedAt: new Date().toISOString(),
  notes: 'Official Trustit Merchant Partner release v3.5.0: Native Android hardware GPS bridge and Google Maps reverse-geocoding for instant store address auto-fetch',
  sizeBytes: otaStats.size
};

const manifestPath = path.join(publicBundlesDir, 'partner-ota-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`✔ Live OTA manifest written: ${manifestPath}`);
console.log(`✔ Live OTA bundle compressed: ${(otaStats.size / (1024 * 1024)).toFixed(2)} MB`);
console.log('🎉 Everything ready for deployment!');
