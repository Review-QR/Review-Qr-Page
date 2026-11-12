import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';

const rootDir = process.cwd();
const bundleDir = path.join(rootDir, 'android-customer-bundle');
const publicBundlesDir = path.join(rootDir, 'public', 'bundles');

const targetVersion = process.argv[2] || '2.6.0';

console.log('========================================================');
console.log(`🚀 TRUSTIT CUSTOMER SUPER-APP — OTA v${targetVersion} PACKAGER`);
console.log('   (Google Maps High-Precision GPS Engine · Active Billing Key)');
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
  throw new Error(`.next/static not found! Please run 'npm run build' first.`);
}
copyDir(staticSrc, path.join(bundleDir, '_next', 'static'));
console.log('✔ Embedded Next.js compiled chunks into android-customer-bundle/_next/static');

// 3. Render /order HTML directly from the freshly compiled .next build
let html = '';
const useExisting3000 = process.argv.includes('--use-existing-3000');
if (useExisting3000) {
  const res = await fetch('http://localhost:3000/order');
  if (!res.ok) throw new Error(`Failed to fetch http://localhost:3000/order: status ${res.status}`);
  html = await res.text();
  console.log(`✔ Fetched Customer Super App HTML from http://localhost:3000/order (${html.length} bytes)`);
} else {
  const nextBin = path.join(rootDir, 'node_modules', 'next', 'dist', 'bin', 'next');
  const tempPort = 3199;
  const serverProc = spawn(process.execPath, [nextBin, 'start', '-p', String(tempPort), '-H', '127.0.0.1'], {
    cwd: rootDir,
    stdio: 'pipe',
  });
  let serverStderr = '';
  serverProc.stderr?.on('data', (d) => {
    serverStderr += String(d);
  });

  try {
    const deadline = Date.now() + 25000;
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`http://127.0.0.1:${tempPort}/order`);
        if (res.ok) {
          html = await res.text();
          console.log(`✔ Rendered fresh Customer Super App HTML from .next build (${html.length} bytes)`);
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 400));
    }
    if (!html) {
      throw new Error(`Timed out rendering /order from ephemeral next start: ${serverStderr}`);
    }
  } finally {
    try {
      serverProc.kill('SIGTERM');
    } catch {}
  }
}

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

      console.log('⚡ Trustit Customer Native Bridge Active');

      // Silent Background Live OTA Check & Auto-Sync
      setTimeout(function() {
        try {
          var bridge = window.Capacitor;
          var payload = {
            manifestUrl: API_HOST + '/api/hyperlocal/ota?app=customer',
            currentVersion: '${targetVersion}'
          };
          if (bridge && typeof bridge.nativePromise === 'function') {
            bridge.nativePromise('TrustitNativeBridge', 'checkAndApplyOta', payload);
          } else if (bridge && typeof bridge.toNative === 'function') {
            bridge.toNative('TrustitNativeBridge', 'checkAndApplyOta', payload);
          }
        } catch(e) {}
      }, 3000);
    })();
  </script>
`;

html = html.replace('<head>', '<head>' + apiInterceptor);
fs.writeFileSync(path.join(bundleDir, 'index.html'), html, 'utf8');
console.log('✔ Injected Native Bridge & OTA sync into android-customer-bundle/index.html');

// 4. Copy Brand Assets
const brandFiles = [
  'customer-icon-192.png',
  'customer-icon-512.png',
  'trustit-icon.svg',
  'trustit-logo.png'
];
for (const bf of brandFiles) {
  const p = path.join(rootDir, 'public', bf);
  if (fs.existsSync(p)) {
    fs.copyFileSync(p, path.join(bundleDir, bf));
  }
}
console.log('✔ Packed Customer Brand Assets');

// 5. Create ZIP archive
fs.mkdirSync(publicBundlesDir, { recursive: true });
const zipPath = path.join(publicBundlesDir, 'customer-bundle-latest.zip');
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

// Archive top-level items explicitly (NOT `.`) so ZipInputStream never sees a `./` root entry
const topEntries = fs.readdirSync(bundleDir);
const quotedEntries = topEntries.map((name) => `"${name.replace(/"/g, '\\"')}"`).join(' ');
execSync(`tar -a -c -f "${zipPath}" -C "${bundleDir}" ${quotedEntries}`);
console.log('✔ Created clean ZIP archive (no ./ root entry) at public/bundles/customer-bundle-latest.zip');

const zipStats = fs.statSync(zipPath);
const timestamp = Date.now();

// 6. Update customer-ota-manifest.json
const manifestPath = path.join(publicBundlesDir, 'customer-ota-manifest.json');
const manifestData = {
  version: targetVersion,
  minAppVersion: "2.2.0",
  bundleUrl: `https://trustitreview.com/bundles/customer-bundle-latest.zip?v=${timestamp}`,
  updatedAt: new Date().toISOString(),
  notes: `Customer Super-App v${targetVersion}: Guest + WhatsApp OTP gate, slim Reward Points banner (350 pts = ₹100), dynamic district GPS detection, admin verified shop badges, horizontal drawer icon, and Option B bottom navigation.`,
  sizeBytes: zipStats.size
};

fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2), 'utf8');
console.log(`✔ Updated public/bundles/customer-ota-manifest.json with version ${targetVersion}`);
console.log(`   Size: ${(zipStats.size / (1024 * 1024)).toFixed(2)} MB (${zipStats.size} bytes)`);

// 7. Sync cleanly into android/app/src/main/assets/public for embedded APK boot
const androidAssetsPublic = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public');
console.log('🔄 Syncing fresh bundle into android/app/src/main/assets/public...');
if (fs.existsSync(androidAssetsPublic)) {
  fs.rmSync(androidAssetsPublic, { recursive: true, force: true });
}
copyDir(bundleDir, androidAssetsPublic);
console.log('✔ Synced directly into Android assets');

console.log(`\n🎉 Customer Super-App OTA v${targetVersion} successfully packaged and ready!`);
