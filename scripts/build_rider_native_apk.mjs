import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { generateSplashPng } from './generate_splash_screens.mjs';

const rootDir = process.cwd();
const androidDir = path.join(rootDir, 'android');
const androidAppDir = path.join(androidDir, 'app');
const flavorResDir = path.join(androidAppDir, 'src', 'rider', 'res');
const bundleDir = path.join(rootDir, 'android-rider-bundle');
const capConfigPath = path.join(rootDir, 'capacitor.config.json');

console.log('======================================================');
console.log('🏍️ TRUSTIT RIDER PARTNER — TRUE NATIVE APK COMPILATION');
console.log('   (Embedded Local Assets Bundle · Zero Web URL · 0.1s Boot)');
console.log('======================================================');

// 1. Prepare Embedded Local Bundle from .next
console.log('\n📦 Step 1: Packaging Compiled UI & Asset Bundle...');

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

// Copy .next/static into bundle
const staticSrc = path.join(rootDir, '.next', 'static');
if (!fs.existsSync(staticSrc)) {
  throw new Error(`.next/static not found! Make sure next build completed.`);
}
copyDir(staticSrc, path.join(bundleDir, '_next', 'static'));
console.log('   ✔ Embedded all JS/CSS/Fonts chunks into bundle/_next/static');

// Read compiled rider.html
const riderHtmlSrc = path.join(rootDir, '.next', 'server', 'app', 'rider.html');
if (!fs.existsSync(riderHtmlSrc)) {
  throw new Error(`rider.html not found at: ${riderHtmlSrc}`);
}
let html = fs.readFileSync(riderHtmlSrc, 'utf8');

// Inject Native OS Socket API Interceptor (routes /api/* directly through Android Native HttpURLConnection to eliminate CORS)
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
                console.warn('[TrustitBridge] Native socket call failed, trying origFetch:', err);
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

      console.log('⚡ Trustit Rider Native Socket Engine: Active (100% CORS-Free Native Android HTTP)');

      // 🚀 Silent Background Live OTA Check & Auto-Sync (Swiggy/Zomato Standard)
      setTimeout(function() {
        try {
          var bridge = window.Capacitor;
          var payload = {
            manifestUrl: API_HOST + '/api/hyperlocal/ota?app=rider',
            currentVersion: '5.3.0'
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
console.log('   ✔ Injected Cloud API Interceptor into local index.html');

// Copy Rider Brand & Media Assets
const brandFiles = [
  'rider-icon-192.png',
  'rider-icon-512.png',
  'trustit-icon.svg',
  'trustit-logo.png',
  'sw-rider.js',
];
for (const bf of brandFiles) {
  const p = path.join(rootDir, 'public', bf);
  if (fs.existsSync(p)) {
    fs.copyFileSync(p, path.join(bundleDir, bf));
  }
}
console.log('   ✔ Packed Rider Brand Assets & Service Worker');

function getDirSize(d) {
  let s = 0;
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    s += fs.statSync(full).isDirectory() ? getDirSize(full) : fs.statSync(full).size;
  }
  return s;
}
const bundleSizeBytes = getDirSize(bundleDir);
const bundleSizeMb = (bundleSizeBytes / (1024 * 1024)).toFixed(2);
console.log(`   📊 Total Embedded Bundle Size: ${bundleSizeMb} MB`);

// 2. Stage capacitor.config.json (WITHOUT server.url, allowMixedContent: false)
console.log('\n⚙️ Step 2: Staging Capacitor for Pure Native Embedded Boot...');
const originalCapConfig = fs.existsSync(capConfigPath) ? fs.readFileSync(capConfigPath, 'utf8') : null;
const capConfig = {
  appId: 'com.trustit.rider',
  appName: 'Trustit Rider',
  webDir: 'android-rider-bundle',
  android: {
    allowMixedContent: false,
    captureInput: true,
    backgroundColor: '#064E3B',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#064E3B',
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
  console.log('   ✔ Staged capacitor.config.json (server.url OMITTED, allowMixedContent: false)');

  // 3. Gradle Product Flavor "rider" manages strings.xml, build.gradle, colors, icons, and ACCESS_BACKGROUND_LOCATION
  console.log('\n📝 Step 3: Using Gradle flavor "rider" (build.gradle, strings.xml & colors.xml untouched).');

  // 4. Generate Splash Screens into rider flavor res/
  console.log('\n🎨 Step 4: Generating High-Res Native Splash Screens into src/rider/res...');
  const splashTemp = path.join(rootDir, 'temp_splash_rider.png');
  try {
    generateSplashPng('rider', splashTemp);
    const splashTargets = [
      path.join(flavorResDir, 'drawable', 'splash.png'),
      path.join(flavorResDir, 'drawable-port-hdpi', 'splash.png'),
      path.join(flavorResDir, 'drawable-port-mdpi', 'splash.png'),
      path.join(flavorResDir, 'drawable-port-xhdpi', 'splash.png'),
      path.join(flavorResDir, 'drawable-port-xxhdpi', 'splash.png'),
      path.join(flavorResDir, 'drawable-port-xxxhdpi', 'splash.png'),
    ];
    for (const target of splashTargets) {
      const p = path.dirname(target);
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
      fs.copyFileSync(splashTemp, target);
    }
    if (fs.existsSync(splashTemp)) fs.unlinkSync(splashTemp);
    console.log('   ✔ Installed branded splash screen into src/rider/res/');
  } catch (err) {
    console.warn(`   ⚠ Skipping splash regeneration (${err.message}); using existing splash resources.`);
  }

  // 5. Capacitor Sync
  console.log('\n🔄 Step 5: Syncing Capacitor Android Project with Embedded Bundle...');
  execSync('npx cap sync android', { cwd: rootDir, stdio: 'inherit' });
} finally {
  if (originalCapConfig !== null) {
    fs.writeFileSync(capConfigPath, originalCapConfig);
  }
}

// 6. Compile Signed Production Release APK via Gradle Product Flavor
console.log('\n🔨 Step 6: Compiling Signed Production APK via Gradle (clean assembleRiderRelease)...');
const gradlewCmd = process.platform === 'win32' ? '.\\gradlew.bat' : './gradlew';
execSync(`${gradlewCmd} clean assembleRiderRelease --no-daemon`, {
  cwd: androidDir,
  stdio: 'inherit',
});

// 7. Copy output APK
const releaseDir = path.join(androidAppDir, 'build', 'outputs', 'apk', 'rider', 'release');
const outputApkSrc = path.join(releaseDir, 'app-rider-release.apk');
const unsignedApkSrc = path.join(releaseDir, 'app-rider-release-unsigned.apk');
if (!fs.existsSync(outputApkSrc)) {
  if (fs.existsSync(unsignedApkSrc)) {
    throw new Error(
      `Gradle built an unsigned APK (${unsignedApkSrc}). Configure TRUSTIT_* env vars or android/keystore.properties for signed release builds.`,
    );
  }
  throw new Error(`Production build failed, output apk not found at: ${outputApkSrc}`);
}

const downloadsDir = path.join(rootDir, 'public', 'downloads');
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

const destDownload = path.join(downloadsDir, 'Trustit-Rider-Partner.apk');
const destPublic = path.join(rootDir, 'public', 'trustit-rider.apk');

fs.copyFileSync(outputApkSrc, destDownload);
fs.copyFileSync(outputApkSrc, destPublic);

const stats = fs.statSync(destDownload);
const finalSizeMb = (stats.size / (1024 * 1024)).toFixed(2);

console.log('\n======================================================');
console.log('🎉 SUCCESS: True Native Embedded APK Compiled!');
console.log(`   APK File: ${destDownload}`);
console.log(`   Direct Link: public/trustit-rider.apk`);
console.log(`   Final APK Size: ${finalSizeMb} MB (Full Embedded UI Bundle)`);
console.log('======================================================');
