import { allowMethods, clientIp, isPrivateIp, json, queryParam } from './_utils.js';

const LOCALE_MAP = {
  zh: 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh-hans': 'zh-CN',
  cn: 'zh-CN',
  en: 'en',
  'en-us': 'en'
};

function normalizeLang(value) {
  const key = String(value || '').trim().toLowerCase();
  return LOCALE_MAP[key] || (key.startsWith('zh') ? 'zh-CN' : 'en');
}

async function fetchIpApi(ip, lang, signal) {
  const url = new URL(`http://ip-api.com/json/${encodeURIComponent(ip)}`);
  url.searchParams.set('fields', 'status,country,regionName,city,isp,as,query');
  url.searchParams.set('lang', lang === 'zh-CN' ? 'zh-CN' : 'en');
  const response = await fetch(url, { signal });
  return response.json();
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'HEAD'])) return;

  const lang = normalizeLang(queryParam(req, 'lang') || req.headers['accept-language']);
  const ip = clientIp(req);
  const base = { ip, country: '', region: '', city: '', isp: '', asn: '', ipv6: ip.includes(':'), lang, source: 'request' };
  if (isPrivateIp(ip)) {
    return json(res, { ...base, note: lang === 'zh-CN' ? '本地或内网访问，公网归属信息不可用' : 'Local or private network address; public geolocation is unavailable' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const data = await fetchIpApi(ip, lang, controller.signal);
    if (data.status === 'success') {
      return json(res, {
        ip: data.query || ip,
        country: data.country || '',
        region: data.regionName || '',
        city: data.city || '',
        isp: data.isp || '',
        asn: data.as || '',
        ipv6: ip.includes(':'),
        lang,
        source: 'ip-api.com'
      });
    }
  } catch {}
  finally { clearTimeout(timer); }
  return json(res, base);
}
