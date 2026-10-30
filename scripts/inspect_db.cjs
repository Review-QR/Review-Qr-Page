const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

const sb = createClient(url, key);

async function main() {
  const { data: b } = await sb.from('businesses').select('id, name, phone').is('deleted_at', null);
  console.log('Active businesses phones:', b?.map(x => `${x.name}: ${x.phone}`));

  const { data: m } = await sb.from('merchant_profiles').select('user_id, mobile, full_name');
  console.log('Merchant profiles count:', m?.length);
  console.log('Merchant profiles sample:', m);

  // Check if 8545965845 exists anywhere
  const phone = '8545965845';
  const { data: pCheck } = await sb.from('merchant_profiles').select('*').ilike('mobile', `%${phone}%`);
  console.log('pCheck (profiles with 8545965845):', pCheck);
  const { data: bCheck } = await sb.from('businesses').select('id, name, phone').ilike('phone', `%${phone}%`);
  console.log('bCheck (businesses with 8545965845):', bCheck);

  const { data: authUsers } = await sb.auth.admin.listUsers();
  console.log('Total auth users:', authUsers?.users?.length);
  const matchedAuth = authUsers?.users?.filter(u => (u.phone && u.phone.includes(phone)) || (u.email && u.email.includes(phone)));
  console.log('matchedAuth:', matchedAuth);
}

main().catch(console.error);
