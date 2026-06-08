import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 8080);

const carriers = [
  {
    key: 'ct',
    name: '中国电信',
    color: '#22c55e',
    endpoints: [
      'https://www.189.cn/',
      'https://www.chinatelecom.com.cn/'
    ]
  },
  {
    key: 'cu',
    name: '中国联通',
    color: '#38bdf8',
    endpoints: [
      'https://www.10010.com/',
      'https://www.chinaunicom.com.cn/'
    ]
  },
  {
    key: 'cm',
    name: '中国移动',
    color: '#f59e0b',
    endpoints: [
      'https://www.10086.cn/',
      'https://www.chinamobileltd.com/'
    ]
  }
];

const links = [
  {
    name: 'CacheFly 100MB',
    url: 'https://cachefly.cachefly.net/100mb.test',
    category: '直链下载',
    desc: '国际 CDN 100MB 测试文件，适合浏览器下载测速参考',
    tags: ['100MB', 'CDN', '下载']
  },
  {
    name: 'Speedtest by Ookla',
    url: 'https://www.speedtest.net/',
    category: '网页测速',
    desc: '全球主流测速入口，可手动选择测速节点',
    tags: ['网页测速', '选节点', '下载上传']
  },
  {
    name: 'Cloudflare Speed Test',
    url: 'https://speed.cloudflare.com/',
    category: '网页测速',
    desc: '展示延迟、抖动、下载、上传等细项指标',
    tags: ['Cloudflare', '指标详细', '抖动']
  },
  {
    name: 'SpeedTest.cn',
    url: 'https://www.speedtest.cn/',
    category: '国内测速',
    desc: '中文测速入口，适合国内宽带、5G、IPv6 诊断',
    tags: ['国内', '中文', 'IPv6']
  },
  {
    name: 'ITDOG HTTP 测速',
    url: 'https://www.itdog.cn/http/',
    category: '拨测',
    desc: '多地区、多运营商 HTTP 拨测，适合看全国访问情况',
    tags: ['三网', '多地区', '拨测']
  }
];

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon'
};

function json(res, data, status = 200) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function text(res, body, status = 200) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = (raw || req.socket.remoteAddress || '').split(',')[0].trim();
  return ip.replace(/^::ffff:/, '');
}

function isPrivateIp(ip) {
  return !ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('10.') || ip.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip);
}

async function ipInfo(req) {
  const ip = clientIp(req);
  const base = { ip, country: '', region: '', city: '', isp: '', asn: '', ipv6: ip.includes(':'), source: 'request' };
  if (isPrivateIp(ip)) return { ...base, note: '本地或内网访问，公网归属信息不可用' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const r = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,isp,as,query`, { signal: controller.signal });
    const data = await r.json();
    if (data.status === 'success') {
      return {
        ip: data.query || ip,
        country: data.country || '',
        region: data.regionName || '',
        city: data.city || '',
        isp: data.isp || '',
        asn: data.as || '',
        ipv6: ip.includes(':'),
        source: 'ip-api.com'
      };
    }
  } catch {}
  finally { clearTimeout(timer); }
  return base;
}

function rating(avg) {
  if (!Number.isFinite(avg)) return { status: 'down', label: '失败', color: '#ef4444' };
  if (avg < 30) return { status: 'excellent', label: '优秀', color: '#22c55e' };
  if (avg < 80) return { status: 'good', label: '良好', color: '#38bdf8' };
  if (avg < 150) return { status: 'normal', label: '一般', color: '#f59e0b' };
  return { status: 'poor', label: '较差', color: '#ef4444' };
}

async function probeUrl(url) {
  const controller = new AbortController();
  const started = performance.now();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    let r = await fetch(url, { method: 'HEAD', signal: controller.signal, cache: 'no-store', redirect: 'follow' });
    if (!r.ok && r.status >= 400) {
      r = await fetch(url, { method: 'GET', signal: controller.signal, cache: 'no-store', redirect: 'follow' });
      await r.body?.cancel?.();
    }
    return { ok: true, ms: Math.round(performance.now() - started), status: r.status, url };
  } catch (err) {
    return { ok: false, ms: null, error: err?.name || 'error', url };
  } finally {
    clearTimeout(timer);
  }
}

async function carrierLatency(carrier) {
  const probes = [];
  for (let round = 0; round < 3; round++) {
    for (const endpoint of carrier.endpoints) probes.push(probeUrl(endpoint));
  }
  const results = await Promise.all(probes);
  const good = results.filter(x => x.ok && Number.isFinite(x.ms)).map(x => x.ms);
  const avg = good.length ? Math.round(good.reduce((a, b) => a + b, 0) / good.length) : null;
  const min = good.length ? Math.min(...good) : null;
  const max = good.length ? Math.max(...good) : null;
  const grade = rating(avg);
  return {
    key: carrier.key,
    name: carrier.name,
    avgMs: avg,
    minMs: min,
    maxMs: max,
    status: grade.status,
    label: grade.label,
    color: grade.color,
    samples: results.length,
    failed: results.filter(x => !x.ok).length,
    endpoints: carrier.endpoints,
    raw: results
  };
}

function parseSize(value) {
  const v = String(value || '10m').toLowerCase();
  const m = v.match(/^(\d+)(k|m)?$/);
  if (!m) return 10 * 1024 * 1024;
  const n = Math.max(1, Math.min(Number(m[1]), 100));
  return m[2] === 'k' ? n * 1024 : n * 1024 * 1024;
}

async function serveStatic(req, res, pathname) {
  let file = pathname === '/' ? '/index.html' : pathname;
  file = path.normalize(file).replace(/^\.\.(\/|\\|$)/, '');
  const full = path.join(PUBLIC_DIR, file);
  if (!full.startsWith(PUBLIC_DIR)) return text(res, 'Forbidden', 403);
  try {
    const st = await stat(full);
    if (!st.isFile()) throw new Error('not file');
    const ext = path.extname(full).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=3600',
      'Content-Length': st.size
    });
    createReadStream(full).pipe(res);
  } catch {
    const index = path.join(PUBLIC_DIR, 'index.html');
    const body = await readFile(index);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(body);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (url.pathname === '/api/health') return json(res, { ok: true, service: 'traffic-speed-tester', time: new Date().toISOString() });
    if (url.pathname === '/api/ip') return json(res, await ipInfo(req));
    if (url.pathname === '/api/links') return json(res, { links });
    if (url.pathname === '/api/latency') {
      const testedAt = new Date().toISOString();
      const data = await Promise.all(carriers.map(carrierLatency));
      return json(res, { testedAt, carriers: data });
    }
    if (url.pathname === '/api/download') {
      const size = parseSize(url.searchParams.get('size'));
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': size,
        'Cache-Control': 'no-store'
      });
      const chunk = Buffer.alloc(64 * 1024, 7);
      let sent = 0;
      while (sent < size) {
        const n = Math.min(chunk.length, size - sent);
        if (!res.write(n === chunk.length ? chunk : chunk.subarray(0, n))) await new Promise(resolve => res.once('drain', resolve));
        sent += n;
      }
      return res.end();
    }
    if (url.pathname === '/api/upload' && req.method === 'POST') {
      let bytes = 0;
      req.on('data', d => { bytes += d.length; });
      req.on('end', () => json(res, { ok: true, bytes }));
      return;
    }
    return serveStatic(req, res, url.pathname);
  } catch (err) {
    return json(res, { error: 'server_error', message: err?.message || String(err) }, 500);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`traffic-speed-tester listening on ${PORT}`);
});
