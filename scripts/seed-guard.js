export function assertDemoTarget(url, allowedHost, enabled) {
  if (enabled !== true) throw new Error('HYTECARE_ALLOW_SEED must equal true');
  let target;
  try { target = new globalThis.URL(url); } catch { throw new Error('Invalid Supabase URL'); }
  if (target.protocol !== 'https:') throw new Error('Supabase URL must use https');
  if (target.username || target.password) throw new Error('URL credentials are forbidden');
  if (target.port || target.pathname !== '/' || target.search || target.hash) throw new Error('Unexpected Supabase URL components');
  if (!/^[a-z0-9-]+\.supabase\.co$/.test(target.hostname)) throw new Error('Host must be an exact supabase.co project');
  if (target.hostname !== allowedHost) throw new Error('Supabase URL is not in the allowlist');
}
