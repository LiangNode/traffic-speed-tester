import { clientIp, isPrivateIp, json } from './_utils.js';

export default async function handler(req, res) {
  const ip = clientIp(req);
  const base = { ip, country: '', region: '', city: '', isp: '', asn: '', ipv6: ip.includes(':'), source: 'request' };
  if (isPrivateIp(ip)) return json(res, { ...base, note: '本地或内网访问，公网归属信息不可用' });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const r = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,isp,as,query`, { signal: controller.signal });
    const data = await r.json();
    if (data.status === 'success') {
      return json(res, {
        ip: data.query || ip,
        country: data.country || '',
        region: data.regionName || '',
        city: data.city || '',
        isp: data.isp || '',
        asn: data.as || '',
        ipv6: ip.includes(':'),
        source: 'ip-api.com'
      });
    }
  } catch {}
  finally { clearTimeout(timer); }
  return json(res, base);
}
