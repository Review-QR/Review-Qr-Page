import fs from 'fs';
import path from 'path';

const bundleDir = 'android-embedded-bundle';
if (fs.existsSync(bundleDir)) {
  fs.rmSync(bundleDir, { recursive: true, force: true });
}
fs.mkdirSync(bundleDir, { recursive: true });

// 1. Copy .next/static into android-embedded-bundle/_next/static
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

console.log('Copying .next/static to bundle...');
copyDir('.next/static', path.join(bundleDir, '_next', 'static'));

// 2. Read partner.html
let html = fs.readFileSync('.next/server/app/partner.html', 'utf8');

// Inject the Cloud API interceptor script right after <head>
const apiInterceptor = `
  <script>
    (function() {
      var API_HOST = 'https://trustitreview.com';
      var bridgeInstance = null;

      function getBridge() {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TrustitNativeBridge) {
          return window.Capacitor.Plugins.TrustitNativeBridge;
        }
        if (!bridgeInstance && window.Capacitor && typeof window.Capacitor.registerPlugin === 'function') {
          try {
            bridgeInstance = window.Capacitor.registerPlugin('TrustitNativeBridge');
          } catch(e) {
            bridgeInstance = null;
          }
        }
        return bridgeInstance;
      }

      function attachFetchProxy() {
        if (window.__trustit_bridge_fetch_active) return;
        window.__trustit_bridge_fetch_active = true;

        var origFetch = window.fetch;
        window.fetch = async function(input, init) {
          var url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
          var method = (init && init.method) || (input && input.method) || 'GET';
          var body = (init && init.body) || '';

          var isApi = typeof url === 'string' && (url.startsWith('/api/') || url.includes('/api/'));

          if (isApi) {
            var targetUrl = url;
            if (url.startsWith('/')) {
              targetUrl = API_HOST + url;
            } else if (url.includes('localhost') || url.includes('127.0.0.1')) {
              targetUrl = url.replace(/https?:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?/, API_HOST);
            }

            var bridge = getBridge();
            if (bridge && typeof bridge.nativeFetch === 'function') {
              try {
                var bodyStr = typeof body === 'string' ? body : (body ? JSON.stringify(body) : '');
                var res = await bridge.nativeFetch({
                  url: targetUrl,
                  method: method,
                  body: bodyStr
                });
                return new Response(res.data, {
                  status: res.status || 200,
                  statusText: 'OK',
                  headers: { 'Content-Type': 'application/json' }
                });
              } catch (err) {
                console.warn('Native bridge fetch error, falling back to browser fetch:', err);
              }
            }

            // Fallback if running in web browser preview
            return origFetch.call(window, targetUrl, init);
          }

          return origFetch.call(window, input, init);
        };
        console.log('⚡ Trustit Native Cloud Bridge (Native HttpsURLConnection Engine) Active');
      }

      attachFetchProxy();
      document.addEventListener('DOMContentLoaded', attachFetchProxy);
      window.addEventListener('load', attachFetchProxy);
    })();
  </script>
`;

html = html.replace('<head>', '<head>' + apiInterceptor);

fs.writeFileSync(path.join(bundleDir, 'index.html'), html);

// 3. Copy essential brand icons
const brandFiles = [
  'merchant-icon-192.png',
  'merchant-icon-512.png',
  'trustit-icon.svg',
  'trustit-logo.png',
  'merchant-sweets-banner.jpg'
];
for (const bf of brandFiles) {
  const p = path.join('public', bf);
  if (fs.existsSync(p)) {
    fs.copyFileSync(p, path.join(bundleDir, bf));
  }
}

console.log('Embedded bundle prepared successfully!');

function getDirSize(d) {
  let s = 0;
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    s += fs.statSync(full).isDirectory() ? getDirSize(full) : fs.statSync(full).size;
  }
  return s;
}

const totalSize = getDirSize(bundleDir);
console.log('Total embedded bundle size:', (totalSize / (1024*1024)).toFixed(2), 'MB');
