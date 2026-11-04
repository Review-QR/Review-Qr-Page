import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\lucky\\.gemini\\antigravity\\brain\\db626298-e663-426c-b461-55060c281aa9';

const targets = [
  {
    name: 'screen01_landing_become_partner.png',
    url: 'http://localhost:3000/merchant/app?auth=false&step=pitch&standalone=true',
    width: 412,
    height: 915
  },
  {
    name: 'screen02_category_wizard_slim.png',
    url: 'http://localhost:3000/merchant/app?auth=false&step=category&standalone=true',
    width: 412,
    height: 915
  },
  {
    name: 'screen03_kyc_registration_unified_phone.png',
    url: 'http://localhost:3000/merchant/app?auth=false&step=kyc&standalone=true',
    width: 412,
    height: 915
  },
  {
    name: 'screen04_partner_login_clean.png',
    url: 'http://localhost:3000/merchant/app?auth=false&step=login&standalone=true',
    width: 412,
    height: 915
  },
  {
    name: 'screen05_kirana_cockpit_dynamic_ankit.png',
    url: 'http://localhost:3000/merchant/app?auth=true&cat=kirana&store=Ankit+Shukla+Kirana+Store&owner=Ankit+Shukla&standalone=true',
    width: 412,
    height: 915
  },
  {
    name: 'screen06_bank_kyc_penny_drop.png',
    url: 'http://localhost:3000/merchant/app?auth=true&cat=kirana&sub=s39&standalone=true',
    width: 412,
    height: 915
  },
  {
    name: 'screen07_desktop_simulator_cockpit.png',
    url: 'http://localhost:3000/merchant/app?auth=true&cat=kirana&store=Ankit+Shukla+Kirana+Store&owner=Ankit+Shukla&standalone=false',
    width: 1280,
    height: 850
  }
];

async function capture() {
  console.log('Starting Chrome headless screen capture...');
  for (const t of targets) {
    const outPath = path.join(artifactDir, t.name);
    console.log(`Capturing ${t.name} from ${t.url} (${t.width}x${t.height})...`);
    
    // Chrome headless command
    const cmd = `"${chromePath}" --headless=new --disable-gpu --hide-scrollbars --window-size=${t.width},${t.height} --virtual-time-budget=4000 --screenshot="${outPath}" "${t.url}"`;
    try {
      execSync(cmd, { stdio: 'pipe' });
      if (fs.existsSync(outPath)) {
        const stats = fs.statSync(outPath);
        console.log(`✓ Saved ${t.name} (${stats.size} bytes)`);
      } else {
        console.error(`✗ Failed to create ${outPath}`);
      }
    } catch (err) {
      console.error(`Error capturing ${t.name}:`, err.message);
    }
  }
  console.log('Capture finished!');
}

capture();
