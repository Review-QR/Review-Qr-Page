import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const bundleDir = path.join(rootDir, 'android-rider-bundle');
const publicBundlesDir = path.join(rootDir, 'public', 'bundles');

console.log('========================================================');
console.log('🚀 TRUSTIT RIDER — ENTERPRISE PRODUCTION OTA v5.3.0 PACKAGER');
console.log('========================================================');

// 1. Clean & create bundle directory
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

// 2. Copy .next/static
const staticSrc = path.join(rootDir, '.next', 'static');
if (!fs.existsSync(staticSrc)) {
  throw new Error(`.next/static not found! Please run 'pnpm run build' first.`);
}
copyDir(staticSrc, path.join(bundleDir, '_next', 'static'));
console.log('✔ Embedded Next.js compiled chunks into android-rider-bundle/_next/static');

// 3. Read & inject rider.html
const riderHtmlSrc = path.join(rootDir, '.next', 'server', 'app', 'rider.html');
if (!fs.existsSync(riderHtmlSrc)) {
  throw new Error(`rider.html not found at: ${riderHtmlSrc}`);
}
let html = fs.readFileSync(riderHtmlSrc, 'utf8');

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
                console.warn('[TrustitBridge] Native socket call failed, falling back:', err);
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

      console.log('⚡ Trustit Rider Native Socket Active');

      // Silent Background Live OTA Check & Auto-Sync
      setTimeout(function() {
        try {
          var bridge = window.Capacitor;
          var payload = {
            manifestUrl: API_HOST + '/api/hyperlocal/ota?app=rider',
            currentVersion: '5.1.0'
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
fs.writeFileSync(path.join(bundleDir, 'index.html'), html, 'utf8');
console.log('✔ Injected Native Bridge & OTA sync into android-rider-bundle/index.html');

// 4. Copy Brand Assets
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
console.log('✔ Packed Rider Brand Assets & Service Worker');

// 5. Create ZIP archive
fs.mkdirSync(publicBundlesDir, { recursive: true });
const zipPath = path.join(publicBundlesDir, 'rider-bundle-latest.zip');
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

execSync(`tar -a -c -f "${zipPath}" -C "${bundleDir}" .`);
console.log('✔ Created ZIP archive at public/bundles/rider-bundle-latest.zip');

const zipStats = fs.statSync(zipPath);
const timestamp = Date.now();

// 6. Update rider-ota-manifest.json
const manifestPath = path.join(publicBundlesDir, 'rider-ota-manifest.json');
const manifestData = {
  version: "5.3.1",
  minAppVersion: "2.5.0",
  bundleUrl: `https://trustitreview.com/bundles/rider-bundle-latest.zip?v=${timestamp}`,
  updatedAt: new Date().toISOString(),
  notes: "Rider Enterprise v5.3.1: Stable back navigation, active-order pickup restoration, nativeFetch bridge, and zero hardcoded store/pack fallbacks.",
  sizeBytes: zipStats.size
};

fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2), 'utf8');
console.log('✔ Updated public/bundles/rider-ota-manifest.json with version 5.3.1');
console.log(`   Size: ${(zipStats.size / (1024 * 1024)).toFixed(2)} MB (${zipStats.size} bytes)`);

// 7. Clean up temp bundle dir
fs.rmSync(bundleDir, { recursive: true, force: true });
console.log('✔ Cleaned up temporary android-rider-bundle directory');

console.log('\n🎉 Production OTA v5.3.0 successfully packaged and ready for deployment!');
