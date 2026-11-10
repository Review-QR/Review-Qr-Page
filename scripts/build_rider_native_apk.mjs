import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { generateSplashPng } from './generate_splash_screens.mjs';

const rootDir = process.cwd();
const androidAppDir = path.join(rootDir, 'android', 'app');
const resDir = path.join(androidAppDir, 'src', 'main', 'res');
const bundleDir = path.join(rootDir, 'android-rider-bundle');

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
  'sw-rider.js'
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

// 2. Configure capacitor.config.json (WITHOUT server.url)
console.log('\n⚙️ Step 2: Configuring Capacitor for Pure Native Embedded Boot...');
const capConfig = {
  appId: "com.trustit.rider",
  appName: "Trustit Rider",
  webDir: "android-rider-bundle",
  android: {
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: "#064E3B"
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#064E3B",
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
console.log('   ✔ Written capacitor.config.json (server.url OMITTED — 100% Native Local Boot)');

// 3. Update Android strings.xml
console.log('\n📝 Step 3: Setting Android Package & App Name...');
const stringsXml = `<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">Trustit Rider</string>
    <string name="title_activity_main">Trustit Rider</string>
    <string name="package_name">com.trustit.rider</string>
    <string name="custom_url_scheme">com.trustit.rider</string>
</resources>
`;
fs.writeFileSync(path.join(resDir, 'values', 'strings.xml'), stringsXml);
console.log('   ✔ strings.xml configured for "Trustit Rider" (com.trustit.rider)');

// 4. Update build.gradle
const gradlePath = path.join(androidAppDir, 'build.gradle');
let gradleContent = fs.readFileSync(gradlePath, 'utf8');
gradleContent = gradleContent.replace(/applicationId\s+"[^"]+"/, `applicationId "com.trustit.rider"`);
gradleContent = gradleContent.replace(/versionCode\s+\d+/, `versionCode 26`);
gradleContent = gradleContent.replace(/versionName\s+"[^"]+"/, `versionName "5.3.0"`);
fs.writeFileSync(gradlePath, gradleContent);
console.log('   ✔ build.gradle updated (applicationId: com.trustit.rider, v5.3.0 New Hardware GPS Build)');

// 5. Install PNG Icons (Trustit Rider branding - delivery rider logo)
// PNG icons were pre-generated in mipmap-* folders; update colors.xml for adaptive icon background
const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>`;
const colorsDir = path.join(resDir, 'values');
fs.writeFileSync(path.join(colorsDir, 'colors.xml'), colorsXml);
console.log('   ✔ PNG icons already installed in mipmap folders; colors.xml set to white background');

// 6. Generate Splash Screens
console.log('\n🎨 Step 4: Generating High-Res Native Splash Screens...');
const splashTemp = path.join(rootDir, 'temp_splash_rider.png');
generateSplashPng('rider', splashTemp);
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
console.log('   ✔ Installed branded splash screen across all Android densities');

// 7. Capacitor Sync
console.log('\n🔄 Step 5: Syncing Capacitor Android Project with Embedded Bundle...');
execSync('npx cap sync android', { cwd: rootDir, stdio: 'inherit' });

// 8. Compile Signed Production Release APK
console.log('\n🔨 Step 6: Compiling Signed Production APK via Gradle (clean assembleRelease)...');
const androidDir = path.join(rootDir, 'android');
execSync('.\\gradlew.bat clean assembleRelease --no-daemon', {
  cwd: androidDir,
  stdio: 'inherit'
});

// 9. Copy output APK
const outputApkSrc = path.join(androidAppDir, 'build', 'outputs', 'apk', 'release', 'app-release.apk');
if (!fs.existsSync(outputApkSrc)) {
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
