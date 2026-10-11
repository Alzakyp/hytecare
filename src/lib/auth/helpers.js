/**
 * @param {string|null|undefined} value
 * @returns {string}
 */
export function safeReturnPath(value) {
  if (!value || typeof value !== 'string') return '/dashboard';
  const trimmed = value.trim();
  const allowed = ['/', '/dashboard', '/tracker', '/reset-password', '/admin/dashboard'];
  return allowed.includes(trimmed) ? trimmed : '/dashboard';
}

/**
 * @param {Record<string, string|undefined>} [env]
 * @returns {boolean}
 */
export function registrationEnabled(env) {
  const current = env ?? {};
  return current.ENABLE_REGISTRATION === 'true';
}
