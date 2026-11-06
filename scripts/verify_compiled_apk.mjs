import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const testDir = 'temp_verify_true_partner';
if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
fs.mkdirSync(testDir);

fs.copyFileSync('public/downloads/Trustit-Merchant-Partner.apk', 'temp_verify.zip');
execSync(`tar -xf temp_verify.zip -C ${testDir}`);
fs.unlinkSync('temp_verify.zip');

const cap = fs.readFileSync(path.join(testDir, 'assets', 'capacitor.config.json'), 'utf8');
console.log('--- capacitor.config.json ---');
console.log(cap);

const html = fs.readFileSync(path.join(testDir, 'assets', 'public', 'index.html'), 'utf8');
console.log('Contains TRUSTIT PARTNER:', html.includes('TRUSTIT PARTNER'));
console.log('Contains TRUSTIT CUSTOMER:', html.includes('TRUSTIT CUSTOMER'));

fs.rmSync(testDir, { recursive: true, force: true });
console.log('VERIFICATION DONE!');
