export function json(res, data, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data, null, 2));
}

export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = (raw || req.socket?.remoteAddress || '').split(',')[0].trim();
  return ip.replace(/^::ffff:/, '');
}

export function isPrivateIp(ip) {
  return !ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('10.') || ip.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip);
}

export function parseSize(value) {
  const v = String(value || '1m').toLowerCase();
  const m = v.match(/^(\d+)(k|m)?$/);
  if (!m) return 10 * 1024 * 1024;
  const n = Math.max(1, Math.min(Number(m[1]), 100));
  return m[2] === 'k' ? n * 1024 : n * 1024 * 1024;
}
