import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { generateSplashPng } from './generate_splash_screens.mjs';

const rootDir = process.cwd();
const androidDir = path.join(rootDir, 'android');
const androidAppDir = path.join(androidDir, 'app');
const capConfigPath = path.join(rootDir, 'capacitor.config.json');

const apps = [
  {
    id: 'customer',
    gradleFlavor: 'Customer',
    appId: 'com.trustit.customer',
    appName: 'Trustit Customer',
    webDir: 'android-customer-bundle',
    bgColor: '#1E3A8A',
    outputApk: 'Trustit-Customer.apk',
    shortApk: 'trustit-customer.apk',
    prepareBundle: () => {
      execSync('node scripts/package-customer-ota.mjs 2.7.6', { cwd: rootDir, stdio: 'inherit' });
    },
  },
  {
    id: 'partner',
    gradleFlavor: 'Partner',
    appId: 'com.trustit.partner',
    appName: 'Trustit Partner',
    webDir: 'android-embedded-bundle',
    bgColor: '#7C2D12',
    outputApk: 'Trustit-Merchant-Partner.apk',
    shortApk: 'trustit-partner.apk',
    prepareBundle: () => {
      execSync('node scripts/prepare_embedded_bundle.mjs partner android-embedded-bundle', {
        cwd: rootDir,
        stdio: 'inherit',
      });
    },
  },
  {
    id: 'rider',
    gradleFlavor: 'Rider',
    appId: 'com.trustit.rider',
    appName: 'Trustit Rider',
    webDir: 'android-rider-bundle',
    bgColor: '#064E3B',
    outputApk: 'Trustit-Rider-Partner.apk',
    shortApk: 'trustit-rider.apk',
    prepareBundle: () => {
      execSync('node scripts/prepare_embedded_bundle.mjs rider android-rider-bundle', {
        cwd: rootDir,
        stdio: 'inherit',
      });
    },
  },
];

function installFlavorSplash(app) {
  const flavorResDir = path.join(androidAppDir, 'src', app.id, 'res');
  const splashTemp = path.join(rootDir, `temp_splash_${app.id}.png`);
  try {
    generateSplashPng(app.id, splashTemp);
  } catch (err) {
    console.warn(`⚠ Skipping splash regeneration for ${app.id} (${err.message}); using existing splash resources.`);
    return;
  }

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
  console.log(`✔ Installed branded native splash screen into src/${app.id}/res/`);
}

function resolveBuiltApk(app) {
  const releaseDir = path.join(androidAppDir, 'build', 'outputs', 'apk', app.id, 'release');
  const signedPath = path.join(releaseDir, `app-${app.id}-release.apk`);
  if (fs.existsSync(signedPath)) return signedPath;

  const unsignedPath = path.join(releaseDir, `app-${app.id}-release-unsigned.apk`);
  if (fs.existsSync(unsignedPath)) {
    throw new Error(
      `Release APK for ${app.id} is unsigned (${unsignedPath}). Configure TRUSTIT_* env vars or android/keystore.properties before distributing.`,
    );
  }
  throw new Error(`Production build failed, output APK not found in: ${releaseDir}`);
}

function buildApp(app) {
  console.log(`\n======================================================`);
  console.log(`🚀 PRODUCTION BUILD [Flavor: ${app.id}]: ${app.appName} (${app.appId})`);
  console.log(`======================================================`);

  // 1. Prepare flavor web bundle
  console.log(`📦 Preparing embedded UI bundle for ${app.id}...`);
  app.prepareBundle();

  // 2. Stage Capacitor config for this flavor (allowMixedContent MUST stay false)
  // Note: Capacitor CLI (`npx cap sync android`) reads a single root capacitor.config.json and writes
  // into src/main/assets/, so we restore the tracked capacitor.config.json after syncing.
  // Gradle Product Flavors handle applicationId, versionCode, versionName, strings.xml, icons, and manifest.
  const originalCapConfig = fs.existsSync(capConfigPath) ? fs.readFileSync(capConfigPath, 'utf8') : null;
  const capConfig = {
    appId: app.appId,
    appName: app.appName,
    webDir: app.webDir,
    android: {
      allowMixedContent: false,
      captureInput: true,
      backgroundColor: app.bgColor,
    },
    plugins: {
      CapacitorHttp: {
        enabled: true,
      },
      SplashScreen: {
        launchShowDuration: 1200,
        launchAutoHide: true,
        backgroundColor: app.bgColor,
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
    console.log(`✔ Staged capacitor.config.json (allowMixedContent: false)`);

    // 3. Install flavor-scoped splash screen (does not mutate src/main/res or build.gradle)
    installFlavorSplash(app);

    // 4. Sync Capacitor Android assets
    console.log(`🔄 Syncing Capacitor Android assets from ${app.webDir}...`);
    execSync('npx cap sync android', { cwd: rootDir, stdio: 'pipe' });
  } finally {
    if (originalCapConfig !== null) {
      fs.writeFileSync(capConfigPath, originalCapConfig);
    }
  }

  // 5. Compile flavor release APK via Gradle Product Flavors (no build.gradle/strings.xml mutation!)
  const gradleTask = `assemble${app.gradleFlavor}Release`;
  console.log(`⏳ Compiling Release APK (./gradlew clean ${gradleTask})...`);
  const gradlewCmd = process.platform === 'win32' ? '.\\gradlew.bat' : './gradlew';
  execSync(`${gradlewCmd} clean ${gradleTask} --no-daemon`, {
    cwd: androidDir,
    stdio: 'inherit',
  });

  // 6. Copy output APK
  const outputApkSrc = resolveBuiltApk(app);
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
  const targetAppId = process.argv[2];
  const appsToBuild = targetAppId ? apps.filter((a) => a.id === targetAppId) : apps;
  if (appsToBuild.length === 0) {
    console.error(`App '${targetAppId}' not found. Available: ${apps.map((a) => a.id).join(', ')}`);
    process.exit(1);
  }
  console.log(`Starting Gradle Product Flavor Build for ${appsToBuild.map((a) => a.appName).join(', ')}...`);
  for (const app of appsToBuild) {
    buildApp(app);
  }
  console.log('\n======================================================');
  console.log('✅ BUILD COMPLETE!');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('❌ Build error:', err);
  process.exit(1);
});
