import { createClient, type User } from '@supabase/supabase-js';
import { assertDemoTarget } from './seed-guard.js';

async function main() {
  const env = process.env;
  assertDemoTarget(env.NEXT_PUBLIC_SUPABASE_URL, env.HYTECARE_ALLOWED_SUPABASE_HOSTS, env.HYTECARE_ALLOW_SEED === 'true');
  if (env.NODE_ENV === 'production') throw new Error('Production provisioning is forbidden');
  if (!env.SUPABASE_SERVICE_ROLE_KEY || !env.HYTECARE_DEMO_PASSWORD || env.HYTECARE_DEMO_PASSWORD.length < 12) {
    throw new Error('Server-only service key and demo password (12+ characters) required');
  }
  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const existing: User[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error('Cannot list Auth users');
    existing.push(...data.users);
    if (data.users.length < 100) break;
  }
  const accounts = [
    { email: 'pasien.demo@hytecare.test', role: 'patient', name: 'Pasien Demonstrasi' },
    { email: 'pasien.baru@hytecare.test', role: 'patient', name: 'Pasien Baru Demonstrasi' },
    { email: 'admin.demo@hytecare.test', role: 'admin', name: 'Admin Demonstrasi' },
  ];
  // Validate every collision before making any changes. app_metadata is server-controlled.
  for (const account of accounts) {
    const user = existing.find(u => u.email?.toLowerCase() === account.email);
    if (user && user.app_metadata.hytecare_demo !== 'v1') throw new Error('Existing non-demo account collision; refusing provisioning');
  }
  for (const account of accounts) {
    let user = existing.find(u => u.email?.toLowerCase() === account.email);
    if (!user) {
      const { data, error } = await client.auth.admin.createUser({ email: account.email, password: env.HYTECARE_DEMO_PASSWORD, email_confirm: true, app_metadata: { hytecare_demo: 'v1' }, user_metadata: { display_name: account.name } });
      if (error || !data.user) throw new Error('Demo Auth provisioning failed');
      user = data.user;
    }
    const { error } = await client.from('user_roles').upsert({ user_id: user.id, role: account.role });
    if (error) throw new Error('Role provisioning failed; apply migrations first');
    console.log(`${account.email}: ${user.id}`);
  }
}
main().catch(() => { console.error('Demo provisioning failed. Verify staging configuration, account markers and migrations.'); process.exitCode = 1; });
