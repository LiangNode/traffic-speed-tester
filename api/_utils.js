export const MAX_LOCAL_DOWNLOAD_BYTES = 4 * 1024 * 1024;
export const DEFAULT_LOCAL_DOWNLOAD_BYTES = 1 * 1024 * 1024;

export function json(res, data, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data, null, 2));
}

export function allowMethods(req, res, methods) {
  if (!req.method || methods.includes(req.method)) return true;
  res.setHeader('Allow', methods.join(', '));
  json(res, { error: 'method_not_allowed', allow: methods }, 405);
  return false;
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

export function queryParam(req, name) {
  if (req.query?.[name]) return req.query[name];
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    return url.searchParams.get(name);
  } catch {
    return null;
  }
}

export function parseSize(value, maxBytes = MAX_LOCAL_DOWNLOAD_BYTES) {
  const raw = String(value || '1m').trim().toLowerCase();
  const match = raw.match(/^(\d+)(k|m)?$/);
  if (!match) return DEFAULT_LOCAL_DOWNLOAD_BYTES;

  const amount = Math.max(1, Number(match[1]));
  const bytes = match[2] === 'k' ? amount * 1024 : amount * 1024 * 1024;
  return Math.min(bytes, maxBytes);
}
