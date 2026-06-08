const $ = id => document.getElementById(id);

const siteTargets = [
  { group: '国内常用网站', name: '百度', url: 'https://www.baidu.com/favicon.ico' },
  { group: '国内常用网站', name: '腾讯 QQ', url: 'https://www.qq.com/favicon.ico' },
  { group: '国内常用网站', name: '阿里云', url: 'https://www.aliyun.com/favicon.ico' },
  { group: '国内常用网站', name: '哔哩哔哩', url: 'https://www.bilibili.com/favicon.ico' },
  { group: '国内常用网站', name: '知乎', url: 'https://www.zhihu.com/favicon.ico' },
  { group: '国内常用网站', name: '清华镜像', url: 'https://mirrors.tuna.tsinghua.edu.cn/favicon.ico' },
  { group: '国外常用网站', name: 'Google', url: 'https://www.google.com/favicon.ico' },
  { group: '国外常用网站', name: 'Cloudflare', url: 'https://www.cloudflare.com/favicon.ico' },
  { group: '国外常用网站', name: 'GitHub', url: 'https://github.com/favicon.ico' },
  { group: '国外常用网站', name: 'YouTube', url: 'https://www.youtube.com/favicon.ico' },
  { group: '国外常用网站', name: 'Wikipedia', url: 'https://www.wikipedia.org/static/favicon/wikipedia.ico' },
  { group: '国外常用网站', name: 'OpenAI', url: 'https://openai.com/favicon.ico' }
];

function gradeLatency(ms) {
  if (!Number.isFinite(ms)) return { label: '失败', cls: 'bad' };
  if (ms < 80) return { label: '优秀', cls: 'good' };
  if (ms < 180) return { label: '良好', cls: 'ok' };
  if (ms < 350) return { label: '一般', cls: 'warn' };
  return { label: '较慢', cls: 'bad' };
}

function renderLatencySkeleton() {
  const groups = [...new Set(siteTargets.map(x => x.group))];
  $('siteLatencyGrid').innerHTML = groups.map(group => {
    const isDomestic = group.includes('国内');
    return `
      <div class="latency-group ${isDomestic ? 'domestic' : 'global'}">
        <div class="latency-group-head">
          <div>
            <span>${isDomestic ? 'CN Sites' : 'Global Sites'}</span>
            <h3>${group}</h3>
          </div>
          <b>${isDomestic ? '国内' : '国外'}</b>
        </div>
        <div class="latency-sites">
          ${siteTargets.filter(x => x.group === group).map(x => `
            <article class="site-card pending" id="site-${siteTargets.indexOf(x)}">
              <div class="site-card-top">
                <span>${x.name}</span>
                <i>测试中</i>
              </div>
              <strong>-- ms</strong>
              <div class="latency-bar"><span style="width:18%"></span></div>
              <em>${isDomestic ? '国内线路' : '国际线路'}</em>
            </article>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

async function probeSite(target, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();
  try {
    await fetch(`${target.url}${target.url.includes('?') ? '&' : '?'}_t=${Date.now()}-${Math.random().toString(16).slice(2)}`, {
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    });
    return { ok: true, ms: Math.round(performance.now() - started) };
  } catch (err) {
    return { ok: false, ms: null, error: err?.name || 'error' };
  } finally {
    clearTimeout(timer);
  }
}

let siteLatencyRefreshing = false;
let siteLatencyTimer = null;

function formatRefreshTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

async function loadSiteLatency() {
  if (siteLatencyRefreshing) return;
  siteLatencyRefreshing = true;
  $('refreshSiteLatency').disabled = true;
  $('refreshSiteLatency').textContent = '刷新中…';
  if (!$('siteLatencyGrid').dataset.ready) {
    renderLatencySkeleton();
    $('siteLatencyGrid').dataset.ready = '1';
  }
  $('siteLatencyAvg').textContent = '测试中…';
  const results = await Promise.all(siteTargets.map(async (target, index) => {
    const result = await probeSite(target);
    const card = document.getElementById(`site-${index}`);
    const grade = gradeLatency(result.ms);
    if (card) {
      card.className = `site-card ${grade.cls}`;
      const width = result.ok ? Math.max(8, Math.min(100, 100 - (result.ms / 500) * 100)) : 100;
      const statusEl = card.querySelector('.site-card-top i');
      const valueEl = card.querySelector('strong');
      const barEl = card.querySelector('.latency-bar span');
      const noteEl = card.querySelector('em');
      if (statusEl) statusEl.textContent = grade.label;
      if (valueEl) valueEl.textContent = result.ok ? `${result.ms} ms` : '失败';
      if (barEl) barEl.style.width = `${width}%`;
      if (noteEl) noteEl.textContent = result.ok ? '访客侧 HTTPS 探测' : '探测失败或超时';
    }
    return result;
  }));
  const ok = results.map(x => x.ms).filter(Number.isFinite);
  $('siteLatencyAvg').textContent = ok.length ? `${Math.round(ok.reduce((a, b) => a + b, 0) / ok.length)} ms` : '全部失败';
  $('refreshSiteLatency').disabled = false;
  $('refreshSiteLatency').textContent = `刷新延时 · ${formatRefreshTime()}`;
  siteLatencyRefreshing = false;
}

function startSiteLatencyAutoRefresh() {
  loadSiteLatency();
  clearInterval(siteLatencyTimer);
  siteLatencyTimer = setInterval(loadSiteLatency, 5000);
}



const state = {
  running: false,
  controllers: [],
  totalBytes: 0,
  lastBytes: 0,
  startedAt: 0,
  lastTick: 0,
  timer: null,
  samples: [],
  latency: []
};

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2)} ${units[i]}`;
}

function formatSpeed(bytesPerSecond) {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return '-';
  return `${formatBytes(bytesPerSecond)}/s`;
}

function formatMbps(bytesPerSecond) {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return '-';
  return `${(bytesPerSecond * 8 / 1024 / 1024).toFixed(2)} Mbps`;
}

async function api(path) {
  const r = await fetch(path, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${path} ${r.status}`);
  return r.json();
}

function selectedUrl() {
  const preset = $('presetUrl').value;
  return preset === 'custom' ? $('customUrl').value.trim() : preset;
}

function urlWithBust(url) {
  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}t=${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function setRunning(on) {
  state.running = on;
  $('startBtn').disabled = on;
  $('stopBtn').disabled = !on;
  $('presetUrl').disabled = on;
  $('customUrl').disabled = on;
  $('threads').disabled = on;
  $('trafficLimit').disabled = on;
  $('status').textContent = on ? '运行中' : '已停止';
}

function resetData() {
  state.totalBytes = 0;
  state.lastBytes = 0;
  state.samples = [];
  state.latency = [];
  state.startedAt = performance.now();
  state.lastTick = state.startedAt;
  $('totalTraffic').textContent = '-';
  $('liveSpeed').textContent = '-';
  $('bandwidth').textContent = '-';
  $('status').textContent = '待开始';
  drawChart();
}

async function worker(id, url, limit) {
  while (state.running) {
    if (limit > 0 && state.totalBytes >= limit && !$('keepRunning').checked) break;
    const controller = new AbortController();
    state.controllers.push(controller);
    try {
      const r = await fetch(urlWithBust(url), { cache: 'no-store', signal: controller.signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      if (!r.body) throw new Error('ReadableStream unavailable');
      const reader = r.body.getReader();
      while (state.running) {
        const { done, value } = await reader.read();
        if (done) break;
        state.totalBytes += value.byteLength;
        if (limit > 0 && state.totalBytes >= limit && !$('keepRunning').checked) {
          stopTest('已达到目标流量');
          break;
        }
      }
    } catch (err) {
      if (state.running) console.warn(`worker ${id}`, err);
      await new Promise(resolve => setTimeout(resolve, 400));
    } finally {
      const idx = state.controllers.indexOf(controller);
      if (idx >= 0) state.controllers.splice(idx, 1);
    }
  }
}

async function probeLatency() {
  const started = performance.now();
  try {
    await fetch(`/api/health?t=${Date.now()}`, { cache: 'no-store' });
    return Math.round(performance.now() - started);
  } catch {
    return null;
  }
}

function tick() {
  const now = performance.now();
  const dt = Math.max((now - state.lastTick) / 1000, 0.001);
  const delta = state.totalBytes - state.lastBytes;
  const speed = delta / dt;
  state.lastBytes = state.totalBytes;
  state.lastTick = now;

  $('totalTraffic').textContent = formatBytes(state.totalBytes);
  $('liveSpeed').textContent = formatSpeed(speed);
  $('bandwidth').textContent = formatMbps(speed);

  state.samples.push(speed);
  if (state.samples.length > 90) state.samples.shift();
  drawChart();
}

async function latencyLoop() {
  while (state.running) {
    const ms = await probeLatency();
    state.latency.push(ms);
    if (state.latency.length > 90) state.latency.shift();
    drawChart();
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
}

function drawChart() {
  const canvas = $('chart');
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(148,163,184,.14)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    const y = h * i / 5;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  const speeds = state.samples;
  const maxSpeed = Math.max(...speeds, 1);
  drawLine(ctx, speeds, maxSpeed, '#38bdf8', value => h - (value / maxSpeed) * (h - 28) - 14);

  const lats = state.latency.map(v => Number.isFinite(v) ? v : 0);
  const maxLat = Math.max(...lats, 100);
  drawLine(ctx, lats, maxLat, '#f59e0b', value => h - (value / maxLat) * (h - 28) - 14);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px system-ui';
  ctx.fillText(`峰值 ${formatMbps(maxSpeed)}`, 24, 36);
}

function drawLine(ctx, values, max, color, yOf) {
  if (values.length < 2) return;
  const w = ctx.canvas.width;
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  values.forEach((value, i) => {
    const x = values.length === 1 ? 0 : i * w / (values.length - 1);
    const y = yOf(value || 0);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function startTest() {
  const url = selectedUrl();
  if (!url) {
    $('status').textContent = '请填写测试地址';
    return;
  }
  resetData();
  setRunning(true);
  const threads = Math.max(1, Math.min(Number($('threads').value) || 1, 64));
  const limit = Number($('trafficLimit').value) || 0;
  state.timer = setInterval(tick, 1000);
  for (let i = 0; i < threads; i++) worker(i + 1, url, limit);
  latencyLoop();
}

function stopTest(reason = '已停止') {
  if (!state.running) return;
  state.running = false;
  state.controllers.forEach(controller => controller.abort());
  state.controllers = [];
  clearInterval(state.timer);
  tick();
  setRunning(false);
  $('status').textContent = reason;
}

async function loadIp() {
  try {
    const data = await api('/api/ip');
    const parts = [data.ip, data.country, data.region, data.city, data.isp].filter(Boolean);
    const text = parts.length ? parts.join(' · ') : 'IP 信息不可用';
    $('ipInfo').textContent = text;
    $('visitorIp').textContent = data.ip || '未知';
    $('visitorMeta').textContent = [data.country, data.region, data.city, data.isp, data.asn].filter(Boolean).join(' · ') || data.note || '暂无归属信息';
  } catch {
    $('ipInfo').textContent = 'IP 查询失败';
    $('visitorIp').textContent = '查询失败';
    $('visitorMeta').textContent = '稍后可刷新重试';
  }
}

$('presetUrl').addEventListener('change', () => {
  $('customWrap').style.display = $('presetUrl').value === 'custom' ? 'grid' : 'none';
});
$('startBtn').addEventListener('click', startTest);
$('stopBtn').addEventListener('click', () => stopTest());
$('resetBtn').addEventListener('click', resetData);
$('refreshSiteLatency').addEventListener('click', loadSiteLatency);
$('customWrap').style.display = 'none';
loadIp();
startSiteLatencyAutoRefresh();
resetData();
