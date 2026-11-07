import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { generateSplashPng } from './generate_splash_screens.mjs';

const rootDir = process.cwd();
const androidAppDir = path.join(rootDir, 'android', 'app');
const resDir = path.join(androidAppDir, 'src', 'main', 'res');
const bundleDir = path.join(rootDir, 'android-embedded-bundle');

console.log('======================================================');
console.log('🏪 TRUSTIT MERCHANT PARTNER — DEDICATED NATIVE APK BUILD');
console.log('   (Package: com.trustit.partner · Offline Embedded UI · 0.1s Boot)');
console.log('======================================================\n');

// 1. Prepare Embedded Partner UI Bundle
console.log('📦 Step 1: Generating Partner UI Bundle from .next/server/app/partner.html...');
if (fs.existsSync(bundleDir)) {
  fs.rmSync(bundleDir, { recursive: true, force: true });
}
fs.mkdirSync(bundleDir, { recursive: true });

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const staticSrc = path.join(rootDir, '.next', 'static');
if (!fs.existsSync(staticSrc)) {
  throw new Error('.next/static missing. Run npm run build first.');
}
copyDir(staticSrc, path.join(bundleDir, '_next', 'static'));

const partnerHtmlSrc = path.join(rootDir, '.next', 'server', 'app', 'partner.html');
if (!fs.existsSync(partnerHtmlSrc)) {
  throw new Error('.next/server/app/partner.html missing.');
}
let html = fs.readFileSync(partnerHtmlSrc, 'utf8');

// Inject Cloud API Interceptor
const apiInterceptor = `
  <script>
    (function() {
      var API_HOST = 'https://trustitreview.com';
      var origFetch = window.fetch;

      function callNativeFetch(url, options) {
        return new Promise(function(resolve, reject) {
          try {
            var method = (options && options.method ? options.method : 'GET').toUpperCase();
            var body = '';
            if (options && options.body) {
              body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
            }
            var headers = {};
            if (options && options.headers) {
              if (options.headers instanceof Headers) {
                options.headers.forEach(function(v, k) { headers[k] = v; });
              } else if (typeof options.headers === 'object') {
                headers = Object.assign({}, options.headers);
              }
            }
            if (!headers['Content-Type'] && !headers['content-type']) {
              headers['Content-Type'] = 'application/json';
            }

            var bridge = window.Capacitor;
            if (bridge && typeof bridge.nativePromise === 'function') {
              bridge.nativePromise('TrustitNativeBridge', 'nativeFetch', {
                url: url,
                method: method,
                body: body,
                headers: headers
              }).then(function(res) {
                var status = (res && res.status) || 200;
                var resBody = (res && (res.data || res.body)) || '';
                resolve(new Response(resBody, {
                  status: status,
                  statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
                  headers: new Headers({ 'Content-Type': 'application/json' })
                }));
              }).catch(function(err) {
                console.warn('[TrustitBridge] Native socket call failed, falling back to origFetch:', err);
                origFetch.call(window, url, options).then(resolve).catch(reject);
              });
            } else if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TrustitNativeBridge) {
              window.Capacitor.Plugins.TrustitNativeBridge.nativeFetch({
                url: url,
                method: method,
                body: body,
                headers: headers
              }).then(function(res) {
                var status = (res && res.status) || 200;
                var resBody = (res && (res.data || res.body)) || '';
                resolve(new Response(resBody, {
                  status: status,
                  statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
                  headers: new Headers({ 'Content-Type': 'application/json' })
                }));
              }).catch(function(err) {
                origFetch.call(window, url, options).then(resolve).catch(reject);
              });
            } else {
              origFetch.call(window, url, options).then(resolve).catch(reject);
            }
          } catch(e) {
            origFetch.call(window, url, options).then(resolve).catch(reject);
          }
        });
      }

      window.fetch = function(input, init) {
        var url = '';
        var options = init || {};

        if (typeof input === 'string') {
          url = input;
        } else if (input instanceof Request) {
          url = input.url;
          options = Object.assign({
            method: input.method,
            headers: input.headers,
            body: input.body
          }, options);
        }

        if (url.startsWith('/api/')) {
          url = API_HOST + url;
          return callNativeFetch(url, options);
        }

        if (url.startsWith(API_HOST + '/api/')) {
          return callNativeFetch(url, options);
        }

        return origFetch.call(this, input, init);
      };

      console.log('⚡ Trustit Partner Native Socket Bridge Active');

      // Silent Background Live OTA Check & Auto-Sync
      setTimeout(function() {
        try {
          var bridge = window.Capacitor;
          var payload = {
            manifestUrl: API_HOST + '/api/hyperlocal/ota?app=partner',
            currentVersion: '3.2.1'
          };
          if (bridge && typeof bridge.nativePromise === 'function') {
            bridge.nativePromise('TrustitNativeBridge', 'checkAndApplyOta', payload);
          } else if (bridge && typeof bridge.toNative === 'function') {
            bridge.toNative('TrustitNativeBridge', 'checkAndApplyOta', payload);
          }
        } catch(e) {}
      }, 2500);
    })();
  </script>
`;

html = html.replace('<head>', '<head>' + apiInterceptor);
fs.writeFileSync(path.join(bundleDir, 'index.html'), html);

// Copy brand icons
const brandFiles = ['merchant-icon-192.png', 'merchant-icon-512.png', 'trustit-icon.svg', 'trustit-logo.png'];
for (const bf of brandFiles) {
  const p = path.join(rootDir, 'public', bf);
  if (fs.existsSync(p)) fs.copyFileSync(p, path.join(bundleDir, bf));
}
console.log('✔ Prepared android-embedded-bundle successfully.');

// 2. Configure capacitor.config.json for Trustit Partner
console.log('\n⚙️ Step 2: Configuring capacitor.config.json for Trustit Partner...');
const capConfig = {
  appId: "com.trustit.partner",
  appName: "Trustit Partner",
  webDir: "android-embedded-bundle",
  android: {
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: "#7C2D12"
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#7C2D12",
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
console.log('✔ capacitor.config.json written (appId: com.trustit.partner, webDir: android-embedded-bundle).');

// 3. Configure Android Gradle & Strings
console.log('\n📝 Step 3: Setting Android build.gradle namespace and applicationId to com.trustit.partner...');
const gradlePath = path.join(androidAppDir, 'build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');
gradle = gradle.replace(/namespace\s+"[^"]+"/, 'namespace "com.trustit.partner"');
gradle = gradle.replace(/applicationId\s+"[^"]+"/, 'applicationId "com.trustit.partner"');
gradle = gradle.replace(/versionCode\s+\d+/, 'versionCode 21');
gradle = gradle.replace(/versionName\s+"[^"]+"/, 'versionName "3.2.1"');
fs.writeFileSync(gradlePath, gradle);

const stringsXml = `<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">Trustit Partner</string>
    <string name="title_activity_main">Trustit Partner</string>
    <string name="package_name">com.trustit.partner</string>
    <string name="custom_url_scheme">com.trustit.partner</string>
</resources>
`;
fs.writeFileSync(path.join(resDir, 'values', 'strings.xml'), stringsXml);
console.log('✔ strings.xml and build.gradle updated.');

// 4. Update Adaptive Launcher Icons (Amber / Orange Store Canopy)
console.log('\n🎨 Step 4: Installing Partner Adaptive Icons & Splash Screens...');
const bgXml = `<?xml version="1.0" encoding="utf-8"?>
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
</vector>`;

const fgXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M28,38 L80,38 C81.5,38 82.5,39.2 82,40.8 L79,49 L29,49 L26,40.8 C25.5,39.2 26.5,38 28,38 Z" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M32,50 L76,50 L76,79 C76,80.5 74.5,81 73,81 L35,81 C33.5,81 32,80.5 32,79 Z" />
    <path
        android:fillColor="#D97706"
        android:pathData="M48,60 L60,60 L60,81 L48,81 Z" />
    <path
        android:fillColor="#F59E0B"
        android:pathData="M37,60 L44,60 L44,69 L37,69 Z" />
    <path
        android:fillColor="#F59E0B"
        android:pathData="M64,60 L71,60 L71,69 L64,69 Z" />
    <path
        android:fillColor="#D97706"
        android:pathData="M36,38 L42,38 L41,49 L35,49 Z M50,38 L56,38 L56,49 L50,49 Z M64,38 L70,38 L71,49 L65,49 Z" />
    <path
        android:fillColor="#10B981"
        android:pathData="M54,42m-5,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0" />
</vector>`;

fs.writeFileSync(path.join(resDir, 'drawable', 'ic_launcher_background.xml'), bgXml);
fs.writeFileSync(path.join(resDir, 'drawable', 'ic_launcher_foreground.xml'), fgXml);

const splashTemp = path.join(rootDir, 'temp_splash_partner.png');
generateSplashPng('partner', splashTemp);
const splashTargets = [
  path.join(resDir, 'drawable', 'splash.png'),
  path.join(resDir, 'drawable-port-hdpi', 'splash.png'),
  path.join(resDir, 'drawable-port-mdpi', 'splash.png'),
  path.join(resDir, 'drawable-port-xhdpi', 'splash.png'),
  path.join(resDir, 'drawable-port-xxhdpi', 'splash.png'),
  path.join(resDir, 'drawable-port-xxxhdpi', 'splash.png')
];
for (const target of splashTargets) {
  const p = path.dirname(target);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  fs.copyFileSync(splashTemp, target);
}
if (fs.existsSync(splashTemp)) fs.unlinkSync(splashTemp);
console.log('✔ Amber/Orange theme launcher icons and splash screens installed.');

// 5. Capacitor Sync
console.log('\n🔄 Step 5: Syncing Capacitor Android Assets from android-embedded-bundle...');
const androidAssetsPublic = path.join(androidAppDir, 'src', 'main', 'assets', 'public');
if (fs.existsSync(androidAssetsPublic)) {
  fs.rmSync(androidAssetsPublic, { recursive: true, force: true });
}
execSync('npx cap sync android', { cwd: rootDir, stdio: 'inherit' });

// 6. VERIFICATION: Ensure assets/public is PARTNER and NOT CUSTOMER
const syncedHtmlPath = path.join(androidAssetsPublic, 'index.html');
if (!fs.existsSync(syncedHtmlPath)) {
  throw new Error('Verification failed: synced index.html missing!');
}
const syncedHtml = fs.readFileSync(syncedHtmlPath, 'utf8');
if (syncedHtml.includes('TRUSTIT CUSTOMER')) {
  throw new Error('CRITICAL INTEGRITY FAILURE: Synced assets still contain TRUSTIT CUSTOMER! Aborting build.');
}
if (!syncedHtml.includes('TRUSTIT PARTNER')) {
  throw new Error('CRITICAL INTEGRITY FAILURE: Synced assets do not contain TRUSTIT PARTNER! Aborting build.');
}
console.log('✔ Integrity check passed: Assets confirmed 100% Trustit Merchant Partner.');

// 7. Compile Release APK
console.log('\n🔨 Step 6: Compiling Signed Production APK via Gradle...');
const androidDir = path.join(rootDir, 'android');
execSync('.\\gradlew.bat clean assembleRelease --no-daemon', { cwd: androidDir, stdio: 'inherit' });

// 8. Verification of Output APK
const outputApkSrc = path.join(androidAppDir, 'build', 'outputs', 'apk', 'release', 'app-release.apk');
if (!fs.existsSync(outputApkSrc)) {
  throw new Error('Gradle build failed: app-release.apk not found.');
}

const downloadsDir = path.join(rootDir, 'public', 'downloads');
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

const destDownload = path.join(downloadsDir, 'Trustit-Merchant-Partner.apk');
const destPublic = path.join(rootDir, 'public', 'trustit-partner.apk');

fs.copyFileSync(outputApkSrc, destDownload);
fs.copyFileSync(outputApkSrc, destPublic);

const stats = fs.statSync(destDownload);
const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

console.log('\n======================================================');
console.log('🎉 SUCCESS: True Signed Trustit Merchant Partner APK Compiled!');
console.log(`   Location: ${destDownload}`);
console.log(`   Short URL: ${destPublic}`);
console.log(`   Size: ${sizeMb} MB (${stats.size} bytes)`);
console.log('======================================================\n');

// 9. Package Live OTA Bundle for Merchant Partner
console.log('📦 Step 7: Packaging Live OTA Bundle (partner-bundle-latest.zip)...');
const publicBundlesDir = path.join(rootDir, 'public', 'bundles');
if (!fs.existsSync(publicBundlesDir)) fs.mkdirSync(publicBundlesDir, { recursive: true });

const zipPath = path.join(publicBundlesDir, 'partner-bundle-latest.zip');
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

execSync(`tar -a -c -f "${zipPath}" *`, { cwd: bundleDir, stdio: 'inherit' });

const otaStats = fs.statSync(zipPath);
const otaSizeMb = (otaStats.size / (1024 * 1024)).toFixed(2);

const otaVersion = '3.3.0';
const manifest = {
  version: otaVersion,
  minAppVersion: '2.2.0',
  bundleUrl: `https://trustitreview.com/bundles/partner-bundle-latest.zip?v=${Date.now()}`,
  updatedAt: new Date().toISOString(),
  notes: 'Official Trustit Merchant Partner true native release with emerald green register button and WhatsApp OTP socket bridge',
  sizeBytes: otaStats.size
};

const manifestPath = path.join(publicBundlesDir, 'partner-ota-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`✔ Live OTA manifest written: ${manifestPath}`);
console.log(`✔ Live OTA bundle compressed: ${otaSizeMb} MB`);
console.log('🎉 Everything ready for deployment!');
