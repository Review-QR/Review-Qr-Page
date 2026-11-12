import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { generateSplashPng } from './generate_splash_screens.mjs';

const rootDir = process.cwd();
const androidDir = path.join(rootDir, 'android');
const androidAppDir = path.join(androidDir, 'app');
const flavorResDir = path.join(androidAppDir, 'src', 'customer', 'res');
const capConfigPath = path.join(rootDir, 'capacitor.config.json');

const targetVersion = process.argv[2] || '2.6.0';
const targetVersionCode = parseInt(process.argv[3] || '16', 10);

console.log('======================================================');
console.log('🛒 TRUSTIT CUSTOMER SUPER-APP — DEDICATED NATIVE APK BUILD');
console.log(`   (Package: com.trustit.customer · v${targetVersion} (${targetVersionCode}) · Google Maps GPS Engine)`);
console.log('======================================================\n');

// 1. Prepare Customer Bundle
console.log(`📦 Step 1: Packaging Customer UI Bundle v${targetVersion}...`);
execSync(`node scripts/package-customer-ota.mjs ${targetVersion}`, { cwd: rootDir, stdio: 'inherit' });

// 2. Configure capacitor.config.json for Trustit Customer (allowMixedContent: false)
console.log('\n⚙️ Step 2: Staging capacitor.config.json for Trustit Customer...');
const originalCapConfig = fs.existsSync(capConfigPath) ? fs.readFileSync(capConfigPath, 'utf8') : null;
const capConfig = {
  appId: 'com.trustit.customer',
  appName: 'Trustit Customer',
  webDir: 'android-customer-bundle',
  android: {
    allowMixedContent: false,
    captureInput: true,
    backgroundColor: '#1E3A8A',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#1E3A8A',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

try {
  fs.writeFileSync(capConfigPath, JSON.stringify(capConfig, null, 2));
  console.log('✔ capacitor.config.json staged (appId: com.trustit.customer, allowMixedContent: false).');

  // 3. Gradle Product Flavor "customer" manages build.gradle, strings.xml, icons, and com.trustit.customer.MainActivity
  console.log('\n📝 Step 3: Using Gradle flavor "customer" (com.trustit.customer.MainActivity, build.gradle & strings.xml untouched).');

  // 4. Generate Splash Screens into customer flavor res/
  console.log('\n🎨 Step 4: Installing Customer Splash Screens into src/customer/res...');
  const splashTemp = path.join(rootDir, 'temp_splash_customer.png');
  try {
    generateSplashPng('customer', splashTemp);
    const splashTargets = [
      path.join(flavorResDir, 'drawable', 'splash.png'),
      path.join(flavorResDir, 'drawable-port-hdpi', 'splash.png'),
      path.join(flavorResDir, 'drawable-port-mdpi', 'splash.png'),
      path.join(flavorResDir, 'drawable-port-xhdpi', 'splash.png'),
      path.join(flavorResDir, 'drawable-port-xxhdpi', 'splash.png'),
      path.join(flavorResDir, 'drawable-port-xxxhdpi', 'splash.png'),
    ];
    for (const target of splashTargets) {
      const parent = path.dirname(target);
      if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
      fs.copyFileSync(splashTemp, target);
    }
    if (fs.existsSync(splashTemp)) fs.unlinkSync(splashTemp);
    console.log('✔ Blue theme splash screens installed into src/customer/res/.');
  } catch (err) {
    console.warn(`⚠ Skipping splash regeneration (${err.message}); using existing splash resources.`);
  }

  // 5. Capacitor Sync
  console.log('\n🔄 Step 5: Syncing Capacitor Android Assets from android-customer-bundle...');
  execSync('npx cap sync android', { cwd: rootDir, stdio: 'inherit' });
} finally {
  if (originalCapConfig !== null) {
    fs.writeFileSync(capConfigPath, originalCapConfig);
  }
}

// 6. Compile via Gradle Product Flavor
console.log('\n🔨 Step 6: Compiling Signed Production APK via Gradle (assembleCustomerRelease)...');
const gradlewCmd = process.platform === 'win32' ? '.\\gradlew.bat' : './gradlew';
execSync(`${gradlewCmd} clean assembleCustomerRelease --no-daemon`, {
  cwd: androidDir,
  stdio: 'inherit',
});

const releaseDir = path.join(androidAppDir, 'build', 'outputs', 'apk', 'customer', 'release');
const outputApkSrc = path.join(releaseDir, 'app-customer-release.apk');
const unsignedApkSrc = path.join(releaseDir, 'app-customer-release-unsigned.apk');
if (!fs.existsSync(outputApkSrc)) {
  if (fs.existsSync(unsignedApkSrc)) {
    throw new Error(
      `Gradle built an unsigned APK (${unsignedApkSrc}). Configure TRUSTIT_* env vars or android/keystore.properties for signed release builds.`,
    );
  }
  throw new Error(`Gradle build finished but output APK not found at: ${outputApkSrc}`);
}

const downloadsDir = path.join(rootDir, 'public', 'downloads');
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

const destDownload = path.join(downloadsDir, 'Trustit-Customer.apk');
const destPublic = path.join(rootDir, 'public', 'trustit-customer.apk');

fs.copyFileSync(outputApkSrc, destDownload);
fs.copyFileSync(outputApkSrc, destPublic);

const apkStats = fs.statSync(destDownload);
const sizeMb = (apkStats.size / (1024 * 1024)).toFixed(2);

console.log('\n======================================================');
console.log('🎉 SUCCESS: True Signed Trustit Customer APK Compiled!');
console.log(`   Location: ${destDownload}`);
console.log(`   Short URL: ${destPublic}`);
console.log(`   Size: ${sizeMb} MB (${apkStats.size} bytes)`);
console.log('======================================================\n');
