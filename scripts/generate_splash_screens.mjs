import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const rootDir = process.cwd();
const resDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');

const splashConfigs = {
  customer: {
    bgGradient: 'linear-gradient(180deg, #1E3A8A 0%, #0F172A 100%)',
    iconBg: '#2563EB',
    icon: '🛒',
    title: 'Trustit Customer',
    subtitle: 'Bahraich Local Super-App • Mandi & Parcha',
    accentColor: '#93C5FD'
  },
  partner: {
    bgGradient: 'linear-gradient(180deg, #7C2D12 0%, #1C1917 100%)',
    iconBg: '#EA580C',
    icon: '🏪',
    title: 'Trustit Partner',
    subtitle: 'Shopkeeper POS & Kitchen Siren Console',
    accentColor: '#FDBA74'
  },
  rider: {
    bgGradient: 'linear-gradient(180deg, #064E3B 0%, #0F172A 100%)',
    iconBg: '#059669',
    icon: '🛵',
    title: 'Trustit Rider',
    subtitle: 'Fleet Partner • Fast Hyperlocal Delivery',
    accentColor: '#6EE7B7'
  }
};

export function generateSplashPng(type, outputPath) {
  const cfg = splashConfigs[type];
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1920px;
    background: ${cfg.bgGradient};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: white;
    text-align: center;
  }
  .icon-box {
    width: 220px;
    height: 220px;
    background: ${cfg.iconBg};
    border-radius: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 110px;
    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
    border: 3.5px solid rgba(255,255,255,0.25);
  }
  .title {
    margin-top: 48px;
    font-size: 56px;
    font-weight: 900;
    letter-spacing: -1.5px;
  }
  .subtitle {
    margin-top: 16px;
    font-size: 26px;
    color: ${cfg.accentColor};
    font-weight: 600;
    letter-spacing: -0.2px;
  }
  .footer {
    position: absolute;
    bottom: 90px;
    font-size: 20px;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 2px;
    font-weight: 700;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <div class="icon-box">${cfg.icon}</div>
  <div class="title">${cfg.title}</div>
  <div class="subtitle">${cfg.subtitle}</div>
  <div class="footer">Trustit Network • Powered by Fast-OT Engine</div>
</body>
</html>`;

  const tempHtmlPath = path.join(rootDir, 'temp_splash.html');
  fs.writeFileSync(tempHtmlPath, htmlContent);

  execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${outputPath}" --window-size=1080,1920 "${tempHtmlPath}"`);
  if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
  console.log(`✔ Generated splash for [${type}] -> ${outputPath}`);
}

// Test run if executed directly
if (process.argv[1]?.endsWith('generate_splash_screens.mjs')) {
  const testOut = path.join(rootDir, 'test_splash_sample.png');
  generateSplashPng('customer', testOut);
}
