import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { generateSplashPng } from './generate_splash_screens.mjs';

const rootDir = process.cwd();
const androidAppDir = path.join(rootDir, 'android', 'app');
const resDir = path.join(androidAppDir, 'src', 'main', 'res');

const apps = [
  {
    id: 'customer',
    appId: 'com.trustit.customer',
    appName: 'Trustit Customer',
    appUrl: 'https://trustitreview.com/order',
    themeColor: '#1D4ED8',
    bgColor: '#1E3A8A',
    outputApk: 'Trustit-Customer.apk',
    shortApk: 'trustit-customer.apk',
    bgXml: `<?xml version="1.0" encoding="utf-8"?>
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
</vector>`,
    fgXml: `<?xml version="1.0" encoding="utf-8"?>
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
</vector>`
  },
  {
    id: 'partner',
    appId: 'com.trustit.partner',
    appName: 'Trustit Partner',
    appUrl: 'https://trustitreview.com/partner',
    themeColor: '#EA580C',
    bgColor: '#7C2D12',
    outputApk: 'Trustit-Merchant-Partner.apk',
    shortApk: 'trustit-partner.apk',
    bgXml: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#D97706"
        android:pathData="M0,0h108v108h-108z" />
    <path
        android:fillColor="#EA580C"
        android:pathData="M54,54m-44,0a44,44 0 1,0 88,0a44,44 0 1,0 -88,0" />
    <path
        android:fillColor="#F97316"
        android:pathData="M54,54m-32,0a32,32 0 1,0 64,0a32,32 0 1,0 -64,0" />
</vector>`,
    fgXml: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Store Awning Canopy Top -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M28,38 L80,38 C81.5,38 82.5,39.2 82,40.8 L79,49 L29,49 L26,40.8 C25.5,39.2 26.5,38 28,38 Z" />
    <!-- Shop Walls & Foundation -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M32,50 L76,50 L76,79 C76,80.5 74.5,81 73,81 L35,81 C33.5,81 32,80.5 32,79 Z" />
    <!-- Shop Counter Door -->
    <path
        android:fillColor="#D97706"
        android:pathData="M48,60 L60,60 L60,81 L48,81 Z" />
    <!-- Left Display Window -->
    <path
        android:fillColor="#F59E0B"
        android:pathData="M37,60 L44,60 L44,69 L37,69 Z" />
    <!-- Right Display Window -->
    <path
        android:fillColor="#F59E0B"
        android:pathData="M64,60 L71,60 L71,69 L64,69 Z" />
    <!-- Storefront Awning Stripes (Amber) -->
    <path
        android:fillColor="#D97706"
        android:pathData="M36,38 L42,38 L41,49 L35,49 Z M50,38 L56,38 L56,49 L50,49 Z M64,38 L70,38 L71,49 L65,49 Z" />
    <!-- Rupee / QR Badge -->
    <path
        android:fillColor="#10B981"
        android:pathData="M54,42m-5,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0" />
</vector>`
  },
  {
    id: 'rider',
    appId: 'com.trustit.rider',
    appName: 'Trustit Rider',
    appUrl: 'https://trustitreview.com/rider',
    themeColor: '#059669',
    bgColor: '#064E3B',
    outputApk: 'Trustit-Rider-Partner.apk',
    shortApk: 'trustit-rider.apk',
    bgXml: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#059669"
        android:pathData="M0,0h108v108h-108z" />
    <path
        android:fillColor="#10B981"
        android:pathData="M54,54m-44,0a44,44 0 1,0 88,0a44,44 0 1,0 -88,0" />
    <path
        android:fillColor="#34D399"
        android:pathData="M54,54m-32,0a32,32 0 1,0 64,0a32,32 0 1,0 -64,0" />
</vector>`,
    fgXml: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Rear Wheel -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M38,72m-8,0a8,8 0 1,0 16,0a8,8 0 1,0 -16,0" />
    <path
        android:fillColor="#059669"
        android:pathData="M38,72m-4,0a4,4 0 1,0 8,0a4,4 0 1,0 -8,0" />
    <!-- Front Wheel -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M73,72m-8,0a8,8 0 1,0 16,0a8,8 0 1,0 -16,0" />
    <path
        android:fillColor="#059669"
        android:pathData="M73,72m-4,0a4,4 0 1,0 8,0a4,4 0 1,0 -8,0" />
    <!-- Scooter Chassis -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M38,67 L51,67 L57,59 L67,59 L73,67 L68,67 L63,56 L56,56 L51,64 L40,64 Z" />
    <!-- Steering column & Handlebar -->
    <path
        android:strokeColor="#FFFFFF"
        android:strokeWidth="3.5"
        android:strokeLineCap="round"
        android:fillColor="#00000000"
        android:pathData="M65,58 L70,44 L65,43" />
    <!-- Delivery Box -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M29,48 L46,48 C47,48 48,49 48,50 L48,63 C48,64 47,65 46,65 L29,65 C28,65 27,64 27,63 L27,50 C27,49 28,48 29,48 Z" />
    <!-- Speed Lines behind Scooter -->
    <path
        android:strokeColor="#FFFFFF"
        android:strokeWidth="2.5"
        android:strokeLineCap="round"
        android:fillColor="#00000000"
        android:pathData="M16,52 L23,52 M12,58 L22,58 M18,64 L24,64" />
    <!-- Rider Helmet -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M56,41m-6,0a6,6 0 1,0 12,0a6,6 0 1,0 -12,0" />
    <path
        android:fillColor="#059669"
        android:pathData="M57,39 L62,41 L57,43 Z" />
</vector>`
  }
];

function buildApp(app) {
  console.log(`\n======================================================`);
  console.log(`🚀 PRODUCTION BUILD: ${app.appName} (${app.appId})`);
  console.log(`======================================================`);

  // 1. Write capacitor.config.json with SplashScreen Plugin
  const capConfig = {
    appId: app.appId,
    appName: app.appName,
    webDir: "public",
    server: {
      url: app.appUrl,
      cleartext: true
    },
    android: {
      allowMixedContent: true,
      captureInput: true,
      backgroundColor: app.bgColor
    },
    plugins: {
      SplashScreen: {
        launchShowDuration: 2200,
        launchAutoHide: true,
        backgroundColor: app.bgColor,
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
  console.log(`✔ Configured capacitor.config.json with Native SplashScreen Plugin`);

  // 2. Write strings.xml
  const stringsXml = `<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">${app.appName}</string>
    <string name="title_activity_main">${app.appName}</string>
    <string name="package_name">${app.appId}</string>
    <string name="custom_url_scheme">${app.appId}</string>
</resources>
`;
  fs.writeFileSync(path.join(resDir, 'values', 'strings.xml'), stringsXml);
  console.log(`✔ Updated strings.xml`);

  // 3. Write build.gradle applicationId
  const gradlePath = path.join(androidAppDir, 'build.gradle');
  let gradleContent = fs.readFileSync(gradlePath, 'utf8');
  gradleContent = gradleContent.replace(/applicationId\s+"[^"]+"/, `applicationId "${app.appId}"`);
  gradleContent = gradleContent.replace(/versionCode\s+\d+/, `versionCode 10`);
  gradleContent = gradleContent.replace(/versionName\s+"[^"]+"/, `versionName "2.2.0"`);
  fs.writeFileSync(gradlePath, gradleContent);
  console.log(`✔ Updated build.gradle with applicationId "${app.appId}" & versionCode 10`);

  // 4. Write adaptive icon drawables
  fs.writeFileSync(path.join(resDir, 'drawable', 'ic_launcher_background.xml'), app.bgXml);
  fs.writeFileSync(path.join(resDir, 'drawable', 'ic_launcher_foreground.xml'), app.fgXml);
  console.log(`✔ Updated adaptive icon vector drawables (Custom Theme & Visual Identity)`);

  // 5. Generate and install custom branded 1080x1920 splash screen
  console.log(`🎨 Generating custom high-res branded splash screen for ${app.id}...`);
  const splashTemp = path.join(rootDir, `temp_splash_${app.id}.png`);
  generateSplashPng(app.id, splashTemp);

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
  console.log(`✔ Installed branded native splash screen across all Android screen densities`);

  // 6. Capacitor Sync
  console.log(`🔄 Syncing Capacitor Android assets...`);
  execSync('npx cap sync android', { cwd: rootDir, stdio: 'pipe' });

  // 7. Clean intermediate build cache and run gradlew assembleRelease
  console.log(`⏳ Compiling Signed Production APK (clean assembleRelease)...`);
  const androidDir = path.join(rootDir, 'android');
  execSync('.\\gradlew.bat clean assembleRelease --no-daemon', {
    cwd: androidDir,
    stdio: 'inherit'
  });

  // 8. Copy output signed APK
  const outputApkSrc = path.join(androidAppDir, 'build', 'outputs', 'apk', 'release', 'app-release.apk');
  if (!fs.existsSync(outputApkSrc)) {
    throw new Error(`Production build failed, output apk not found at: ${outputApkSrc}`);
  }

  const downloadsDir = path.join(rootDir, 'public', 'downloads');
  if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

  const destDownload = path.join(downloadsDir, app.outputApk);
  const destPublic = path.join(rootDir, 'public', app.shortApk);

  fs.copyFileSync(outputApkSrc, destDownload);
  fs.copyFileSync(outputApkSrc, destPublic);

  const stats = fs.statSync(destDownload);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`🎉 SUCCESS: Built Signed Production APK for ${app.appName}!`);
  console.log(`   Location: ${destDownload} (${sizeMb} MB)`);
}

async function run() {
  console.log("Starting Full Signed Production Build for all 3 apps...");
  for (const app of apps) {
    buildApp(app);
  }
  console.log("\n======================================================");
  console.log("✅ ALL 3 SIGNED PRODUCTION APPS BUILT WITH NATIVE SPLASH & KEYSTORE!");
  console.log("======================================================");
}

run().catch((err) => {
  console.error("❌ Build error:", err);
  process.exit(1);
});
