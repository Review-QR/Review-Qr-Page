import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { generateSplashPng } from './generate_splash_screens.mjs';

const rootDir = process.cwd();
const androidAppDir = path.join(rootDir, 'android', 'app');
const resDir = path.join(androidAppDir, 'src', 'main', 'res');
const bundleDir = path.join(rootDir, 'android-customer-bundle');

const targetVersion = process.argv[2] || '2.6.0';
const targetVersionCode = parseInt(process.argv[3] || '16', 10);

console.log('======================================================');
console.log('🛒 TRUSTIT CUSTOMER SUPER-APP — DEDICATED NATIVE APK BUILD');
console.log(`   (Package: com.trustit.customer · v${targetVersion} (${targetVersionCode}) · Google Maps GPS Engine)`);
console.log('======================================================\n');

// 1. Prepare Customer Bundle
console.log(`📦 Step 1: Packaging Customer UI Bundle v${targetVersion}...`);
execSync(`node scripts/package-customer-ota.mjs ${targetVersion}`, { cwd: rootDir, stdio: 'inherit' });

// 2. Configure capacitor.config.json for Trustit Customer
console.log('\n⚙️ Step 2: Configuring capacitor.config.json for Trustit Customer...');
const capConfig = {
  appId: "com.trustit.customer",
  appName: "Trustit Customer",
  webDir: "android-customer-bundle",
  android: {
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: "#1E3A8A"
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#1E3A8A",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};
fs.writeFileSync(path.join(rootDir, 'capacitor.config.json'), JSON.stringify(capConfig, null, 2));
console.log('✔ capacitor.config.json written (appId: com.trustit.customer, webDir: android-customer-bundle).');

// 3. Configure Android Gradle & Strings
console.log('\n📝 Step 3: Setting Android build.gradle namespace and applicationId to com.trustit.customer...');
const gradlePath = path.join(androidAppDir, 'build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');
gradle = gradle.replace(/namespace\s+"[^"]+"/, 'namespace "com.trustit.customer"');
gradle = gradle.replace(/applicationId\s+"[^"]+"/, 'applicationId "com.trustit.customer"');
gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${targetVersionCode}`);
gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${targetVersion}"`);
fs.writeFileSync(gradlePath, gradle);

const stringsXml = `<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">Trustit Customer</string>
    <string name="title_activity_main">Trustit Customer</string>
    <string name="package_name">com.trustit.customer</string>
    <string name="custom_url_scheme">com.trustit.customer</string>
</resources>
`;
fs.writeFileSync(path.join(resDir, 'values', 'strings.xml'), stringsXml);
const manifestPath = path.join(androidAppDir, 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  manifest = manifest.replace(
    /android:name="(?:com\.trustit\.[^"]+\.)?MainActivity"/,
    'android:name="com.trustit.customer.MainActivity"',
  );
  fs.writeFileSync(manifestPath, manifest);
}
console.log('✔ strings.xml, build.gradle, and AndroidManifest.xml updated.');

// 4. Update Adaptive Launcher Icons (Blue Shopping Bag)
console.log('\n🎨 Step 4: Installing Customer Adaptive Icons & Splash Screens...');
const bgXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#1D4ED8"
        android:pathData="M0,0h108v108h-108z" />
    <path
        android:fillColor="#2563EB"
        android:pathData="M54,54m-44,0a44,44 0 1,0 88,0a44,44 0 1,0 -88,0" />
    <path
        android:fillColor="#3B82F6"
        android:pathData="M54,54m-32,0a32,32 0 1,0 64,0a32,32 0 1,0 -64,0" />
</vector>`;

const fgXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Shopping Bag Body -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M37,42 L71,42 C73,42 74.5,43.5 74.3,45.5 L71.5,78 C71.3,79.8 69.8,81 68,81 L40,81 C38.2,81 36.7,79.8 36.5,78 L33.7,45.5 C33.5,43.5 35,42 37,42 Z" />
    <!-- Handle -->
    <path
        android:strokeColor="#FFFFFF"
        android:strokeWidth="4"
        android:strokeLineCap="round"
        android:fillColor="#00000000"
        android:pathData="M46,44 C46,33 62,33 62,44" />
    <!-- Blue 'T' Logo on Bag -->
    <path
        android:fillColor="#1D4ED8"
        android:pathData="M46,54 L62,54 L62,58 L56,58 L56,72 L52,72 L52,58 L46,58 Z" />
    <!-- Yellow Rating Star -->
    <path
        android:fillColor="#FBBF24"
        android:pathData="M70,36 L72,41 L77,41.5 L73,45 L74.2,50 L70,47 L65.8,50 L67,45 L63,41.5 L68,41 Z" />
</vector>`;

fs.writeFileSync(path.join(resDir, 'drawable', 'ic_launcher_background.xml'), bgXml);
fs.writeFileSync(path.join(resDir, 'drawable', 'ic_launcher_foreground.xml'), fgXml);

const splashTemp = path.join(rootDir, 'temp_splash_customer.png');
generateSplashPng('customer', splashTemp);

const splashTargets = [
  path.join(resDir, 'drawable', 'splash.png'),
  path.join(resDir, 'drawable-port-hdpi', 'splash.png'),
  path.join(resDir, 'drawable-port-mdpi', 'splash.png'),
  path.join(resDir, 'drawable-port-xhdpi', 'splash.png'),
  path.join(resDir, 'drawable-port-xxhdpi', 'splash.png'),
  path.join(resDir, 'drawable-port-xxxhdpi', 'splash.png')
];

for (const target of splashTargets) {
  const parent = path.dirname(target);
  if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
  fs.copyFileSync(splashTemp, target);
}
if (fs.existsSync(splashTemp)) fs.unlinkSync(splashTemp);
console.log('✔ Blue theme launcher icons and splash screens installed.');

// 5. Capacitor Sync
console.log('\n🔄 Step 5: Syncing Capacitor Android Assets from android-customer-bundle...');
execSync('npx cap sync android', { cwd: rootDir, stdio: 'inherit' });

// 6. Compile via Gradle
console.log('\n🔨 Step 6: Compiling Signed Production APK via Gradle...');
const androidDir = path.join(rootDir, 'android');
execSync('.\\gradlew.bat clean assembleRelease', {
  cwd: androidDir,
  stdio: 'inherit'
});

const outputApkSrc = path.join(androidAppDir, 'build', 'outputs', 'apk', 'release', 'app-release.apk');
if (!fs.existsSync(outputApkSrc)) {
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
console.log(`🎉 SUCCESS: True Signed Trustit Customer APK Compiled!`);
console.log(`   Location: ${destDownload}`);
console.log(`   Short URL: ${destPublic}`);
console.log(`   Size: ${sizeMb} MB (${apkStats.size} bytes)`);
console.log('======================================================\n');
