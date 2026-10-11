const patientPaths = ['/dashboard', '/tracker', '/edukasi', '/game', '/lainnya', '/kontak-darurat', '/profil'];
const under = (path, root) => path === root || path.startsWith(`${root}/`);

/** @param {'patient'|'admin'|null|string} role @param {string} pathname @returns {string|null} */
export function destination(role, pathname) {
  const admin = under(pathname, '/admin');
  const patient = patientPaths.some((root) => under(pathname, root));
  if (pathname === '/' || admin || patient) {
    if (role === null) return '/login';
    if (role !== 'patient' && role !== 'admin') return '/403';
    if (pathname === '/') return role === 'admin' ? '/admin/dashboard' : '/dashboard';
    if ((admin && role !== 'admin') || (patient && role !== 'patient')) return '/403';
  }
  return null;
}
