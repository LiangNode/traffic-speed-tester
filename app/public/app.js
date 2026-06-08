const $ = id => document.getElementById(id);

const I18N = {
  zh: {
    htmlLang: 'zh-CN',
    title: '流量测速器',
    subtitle: '选择测试地址、线程和目标流量后，在本页直接运行测速，并实时显示速度、带宽和曲线。',
    networkTitle: '访客网络与网站延时',
    networkDesc: '访客 IP，从访客浏览器侧探测国内 / 国外常用网站访问耗时。',
    refreshLatency: '刷新延时',
    refreshing: '刷新中…',
    visitorIp: '访客 IP',
    loadingIp: '查询中…',
    loadingMeta: '正在查询归属地和运营商',
    avgLatency: '平均延时',
    avgLatencyNote: '统计成功探测的网站',
    latencyLoading: '延时数据加载中…',
    latencyHint: '浏览器无法直接 ICMP Ping，这里用 HTTPS 请求耗时估算；部分站点可能因网络策略或跨域限制显示失败。',
    settings: '测试设置',
    ipLoading: 'IP 查询中…',
    testUrl: '测试地址',
    customUrl: '自定义地址',
    customPlaceholder: 'https://example.com/file.bin',
    threads: '线程',
    totalLimit: '总流量',
    keepRunning: '达到总流量后继续后台运行，直到手动停止',
    start: '开始测试',
    stop: '停止',
    reset: '清空数据',
    sourceHint: '说明：本机源仅提供轻量测试包；大流量测速建议使用外部 CORS 可读源或自定义地址。',
    totalTraffic: '总流量',
    liveSpeed: '实时速度',
    bandwidth: '带宽',
    status: '运行状态',
    idle: '待开始',
    running: '运行中',
    stopped: '已停止',
    reached: '已达到目标流量',
    needUrl: '请填写测试地址',
    chartTitle: '实时图表',
    rate: '速率',
    latency: '延迟',
    peak: '峰值',
    project: '项目地址',
    unavailableIp: 'IP 信息不可用',
    unknown: '未知',
    ipFailed: 'IP 查询失败',
    retry: '稍后可刷新重试',
    noMeta: '暂无归属信息',
    probing: '测试中',
    fail: '失败',
    excellent: '优秀',
    good: '良好',
    normal: '一般',
    slow: '较慢',
    allFailed: '全部失败',
    domestic: '国内',
    global: '国外',
    domesticSites: '国内常用网站',
    globalSites: '国外常用网站',
    domesticLine: '国内线路',
    globalLine: '国际线路',
    browserProbe: '访客侧 HTTPS 探测',
    probeFailed: '探测失败或超时',
    groups: { domestic: 'CN Sites', global: 'Global Sites' },
    targets: {
      baidu: '百度', qq: '腾讯 QQ', aliyun: '阿里云', bilibili: '哔哩哔哩', zhihu: '知乎', tuna: '清华镜像',
      google: 'Google', cloudflare: 'Cloudflare', github: 'GitHub', youtube: 'YouTube', wikipedia: 'Wikipedia', openai: 'OpenAI'
    }
  },
  en: {
    htmlLang: 'en',
    title: 'Traffic Speed Tester',
    subtitle: 'Choose a test URL, thread count, and traffic target, then run the test with live speed, bandwidth, and charts.',
    networkTitle: 'Visitor Network & Website Latency',
    networkDesc: 'Visitor IP, with browser-side latency checks for common China and global websites.',
    refreshLatency: 'Refresh latency',
    refreshing: 'Refreshing…',
    visitorIp: 'Visitor IP',
    loadingIp: 'Loading…',
    loadingMeta: 'Looking up location and ISP',
    avgLatency: 'Average latency',
    avgLatencyNote: 'Successful website probes',
    latencyLoading: 'Loading latency data…',
    latencyHint: 'Browsers cannot run ICMP ping directly, so HTTPS request timing is used as an estimate. Some sites may fail because of network policy or cross-origin limits.',
    settings: 'Test Settings',
    ipLoading: 'Loading IP…',
    testUrl: 'Test URL',
    customUrl: 'Custom URL',
    customPlaceholder: 'https://example.com/file.bin',
    threads: 'Threads',
    totalLimit: 'Traffic limit',
    keepRunning: 'Keep running in the background after reaching the limit until manually stopped',
    start: 'Start Test',
    stop: 'Stop',
    reset: 'Reset',
    sourceHint: 'Note: local sources only provide lightweight test packages; for large traffic tests, use external CORS-readable sources or a custom URL.',
    totalTraffic: 'Total Traffic',
    liveSpeed: 'Live Speed',
    bandwidth: 'Bandwidth',
    status: 'Status',
    idle: 'Ready',
    running: 'Running',
    stopped: 'Stopped',
    reached: 'Traffic limit reached',
    needUrl: 'Please enter a test URL',
    chartTitle: 'Live Chart',
    rate: 'Speed',
    latency: 'Latency',
    peak: 'Peak',
    project: 'Project',
    unavailableIp: 'IP information unavailable',
    unknown: 'Unknown',
    ipFailed: 'IP lookup failed',
    retry: 'Please try again later',
    noMeta: 'No location details available',
    probing: 'Testing',
    fail: 'Failed',
    excellent: 'Excellent',
    good: 'Good',
    normal: 'Fair',
    slow: 'Slow',
    allFailed: 'All failed',
    domestic: 'China',
    global: 'Global',
    domesticSites: 'Common China Websites',
    globalSites: 'Common Global Websites',
    domesticLine: 'China route',
    globalLine: 'Global route',
    browserProbe: 'Visitor-side HTTPS probe',
    probeFailed: 'Probe failed or timed out',
    groups: { domestic: 'CN Sites', global: 'Global Sites' },
    targets: {
      baidu: 'Baidu', qq: 'Tencent QQ', aliyun: 'Alibaba Cloud', bilibili: 'Bilibili', zhihu: 'Zhihu', tuna: 'Tsinghua Mirror',
      google: 'Google', cloudflare: 'Cloudflare', github: 'GitHub', youtube: 'YouTube', wikipedia: 'Wikipedia', openai: 'OpenAI'
    }
  }
};

const siteTargets = [
  { type: 'domestic', key: 'baidu', url: 'https://www.baidu.com/favicon.ico' },
  { type: 'domestic', key: 'qq', url: 'https://www.qq.com/favicon.ico' },
  { type: 'domestic', key: 'aliyun', url: 'https://www.aliyun.com/favicon.ico' },
  { type: 'domestic', key: 'bilibili', url: 'https://www.bilibili.com/favicon.ico' },
  { type: 'domestic', key: 'zhihu', url: 'https://www.zhihu.com/favicon.ico' },
  { type: 'domestic', key: 'tuna', url: 'https://mirrors.tuna.tsinghua.edu.cn/favicon.ico' },
  { type: 'global', key: 'google', url: 'https://www.google.com/favicon.ico' },
  { type: 'global', key: 'cloudflare', url: 'https://www.cloudflare.com/favicon.ico' },
  { type: 'global', key: 'github', url: 'https://github.com/favicon.ico' },
  { type: 'global', key: 'youtube', url: 'https://www.youtube.com/favicon.ico' },
  { type: 'global', key: 'wikipedia', url: 'https://www.wikipedia.org/static/favicon/wikipedia.ico' },
  { type: 'global', key: 'openai', url: 'https://openai.com/favicon.ico' }
];

const savedLang = localStorage.getItem('tst-lang');
let lang = savedLang || ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
let siteLatencyRefreshing = false;
let siteLatencyTimer = null;

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

function t(key) { return I18N[lang][key]; }
function targetName(target) { return I18N[lang].targets[target.key]; }
function groupName(type) { return type === 'domestic' ? t('domesticSites') : t('globalSites'); }
function routeName(type) { return type === 'domestic' ? t('domesticLine') : t('globalLine'); }

function setText(id, value) { const el = $(id); if (el) el.textContent = value; }

function applyLanguage(nextLang = lang, options = {}) {
  lang = nextLang === 'zh' ? 'zh' : 'en';
  localStorage.setItem('tst-lang', lang);
  document.documentElement.lang = I18N[lang].htmlLang;
  document.title = t('title');

  setText('pageTitle', t('title'));
  setText('pageSubtitle', t('subtitle'));
  setText('refreshSiteLatency', t('refreshLatency'));
  setText('projectLabel', t('project'));

  const selectors = [
    ['.network-hero h2', t('networkTitle')], ['.section-desc', t('networkDesc')],
    ['.primary-ip > span', t('visitorIp')], ['.latency-summary > span', t('avgLatency')], ['.latency-summary em', t('avgLatencyNote')],
    ['.latency-hint', t('latencyHint')], ['.settings .section-title h2', t('settings')],
    ['label[for="none"]', '']
  ];
  selectors.forEach(([sel, text]) => { const el = document.querySelector(sel); if (el) el.textContent = text; });

  const fieldLabels = document.querySelectorAll('.settings .field > span');
  [t('testUrl'), t('customUrl'), t('threads'), t('totalLimit')].forEach((text, i) => { if (fieldLabels[i]) fieldLabels[i].textContent = text; });
  $('customUrl').placeholder = t('customPlaceholder');
  document.querySelector('.check span').textContent = t('keepRunning');
  setText('startBtn', t('start'));
  setText('stopBtn', t('stop'));
  setText('resetBtn', t('reset'));
  document.querySelector('.settings .hint').textContent = t('sourceHint');

  const metricLabels = document.querySelectorAll('.metric span');
  [t('totalTraffic'), t('liveSpeed'), t('bandwidth'), t('status')].forEach((text, i) => { if (metricLabels[i]) metricLabels[i].textContent = text; });
  document.querySelector('.chart-card .section-title h2').textContent = t('chartTitle');
  document.querySelector('.chart-card .section-title span').innerHTML = `<b class="dot speed"></b>${t('rate')} <b class="dot latency"></b>${t('latency')}`;
  $('langZh').classList.toggle('active', lang === 'zh');
  $('langEn').classList.toggle('active', lang === 'en');

  if (!state.running && $('status').textContent !== t('reached')) $('status').textContent = t('idle');
  if (!$('siteLatencyGrid').dataset.ready) $('siteLatencyGrid').innerHTML = `<div class="empty-line">${t('latencyLoading')}</div>`;
  renderLatencySkeleton();
  drawChart();
  if (!options.skipIp) loadIp();
}

function gradeLatency(ms) {
  if (!Number.isFinite(ms)) return { label: t('fail'), cls: 'bad' };
  if (ms < 80) return { label: t('excellent'), cls: 'good' };
  if (ms < 180) return { label: t('good'), cls: 'ok' };
  if (ms < 350) return { label: t('normal'), cls: 'warn' };
  return { label: t('slow'), cls: 'bad' };
}

function renderLatencySkeleton() {
  const groups = ['domestic', 'global'];
  $('siteLatencyGrid').innerHTML = groups.map(type => `
    <div class="latency-group ${type}">
      <div class="latency-group-head">
        <div>
          <span>${I18N[lang].groups[type]}</span>
          <h3>${groupName(type)}</h3>
        </div>
        <b>${type === 'domestic' ? t('domestic') : t('global')}</b>
      </div>
      <div class="latency-sites">
        ${siteTargets.filter(x => x.type === type).map(target => `
          <article class="site-card pending" id="site-${siteTargets.indexOf(target)}">
            <div class="site-card-top">
              <span>${targetName(target)}</span>
              <i>${t('probing')}</i>
            </div>
            <strong>-- ms</strong>
            <div class="latency-bar"><span style="width:18%"></span></div>
            <em>${routeName(type)}</em>
          </article>
        `).join('')}
      </div>
    </div>
  `).join('');
  $('siteLatencyGrid').dataset.ready = '1';
}

async function probeSite(target, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();
  try {
    await fetch(`${target.url}${target.url.includes('?') ? '&' : '?'}_t=${Date.now()}-${Math.random().toString(16).slice(2)}`, { mode: 'no-cors', cache: 'no-store', signal: controller.signal });
    return { ok: true, ms: Math.round(performance.now() - started) };
  } catch (err) {
    return { ok: false, ms: null, error: err?.name || 'error' };
  } finally {
    clearTimeout(timer);
  }
}

function formatRefreshTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

async function loadSiteLatency() {
  if (siteLatencyRefreshing) return;
  siteLatencyRefreshing = true;
  $('refreshSiteLatency').disabled = true;
  $('refreshSiteLatency').textContent = t('refreshing');
  renderLatencySkeleton();
  $('siteLatencyAvg').textContent = t('probing');
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
      if (valueEl) valueEl.textContent = result.ok ? `${result.ms} ms` : t('fail');
      if (barEl) barEl.style.width = `${width}%`;
      if (noteEl) noteEl.textContent = result.ok ? t('browserProbe') : t('probeFailed');
    }
    return result;
  }));
  const ok = results.map(x => x.ms).filter(Number.isFinite);
  $('siteLatencyAvg').textContent = ok.length ? `${Math.round(ok.reduce((a, b) => a + b, 0) / ok.length)} ms` : t('allFailed');
  $('refreshSiteLatency').disabled = false;
  $('refreshSiteLatency').textContent = `${t('refreshLatency')} · ${formatRefreshTime()}`;
  siteLatencyRefreshing = false;
}

function startSiteLatencyAutoRefresh() {
  loadSiteLatency();
  clearInterval(siteLatencyTimer);
  siteLatencyTimer = setInterval(loadSiteLatency, 5000);
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2)} ${units[i]}`;
}
function formatSpeed(bytesPerSecond) { return !Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0 ? '-' : `${formatBytes(bytesPerSecond)}/s`; }
function formatMbps(bytesPerSecond) { return !Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0 ? '-' : `${(bytesPerSecond * 8 / 1024 / 1024).toFixed(2)} Mbps`; }
async function api(path) { const r = await fetch(path, { cache: 'no-store' }); if (!r.ok) throw new Error(`${path} ${r.status}`); return r.json(); }
function selectedUrl() { const preset = $('presetUrl').value; return preset === 'custom' ? $('customUrl').value.trim() : preset; }
function urlWithBust(url) { return `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}-${Math.random().toString(16).slice(2)}`; }

function setRunning(on) {
  state.running = on;
  ['startBtn', 'presetUrl', 'customUrl', 'threads', 'trafficLimit'].forEach(id => { $(id).disabled = on; });
  $('stopBtn').disabled = !on;
  $('status').textContent = on ? t('running') : t('stopped');
}

function resetData() {
  state.totalBytes = 0; state.lastBytes = 0; state.samples = []; state.latency = [];
  state.startedAt = performance.now(); state.lastTick = state.startedAt;
  $('totalTraffic').textContent = '-'; $('liveSpeed').textContent = '-'; $('bandwidth').textContent = '-'; $('status').textContent = t('idle');
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
        if (limit > 0 && state.totalBytes >= limit && !$('keepRunning').checked) { stopTest(t('reached')); break; }
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
async function probeLatency() { const started = performance.now(); try { await fetch(`/api/health?t=${Date.now()}`, { cache: 'no-store' }); return Math.round(performance.now() - started); } catch { return null; } }

function tick() {
  const now = performance.now();
  const dt = Math.max((now - state.lastTick) / 1000, 0.001);
  const speed = (state.totalBytes - state.lastBytes) / dt;
  state.lastBytes = state.totalBytes; state.lastTick = now;
  $('totalTraffic').textContent = formatBytes(state.totalBytes);
  $('liveSpeed').textContent = formatSpeed(speed);
  $('bandwidth').textContent = formatMbps(speed);
  state.samples.push(speed); if (state.samples.length > 90) state.samples.shift();
  drawChart();
}
async function latencyLoop() { while (state.running) { const ms = await probeLatency(); state.latency.push(ms); if (state.latency.length > 90) state.latency.shift(); drawChart(); await new Promise(resolve => setTimeout(resolve, 1200)); } }

function drawChart() {
  const canvas = $('chart');
  const ctx = canvas.getContext('2d');
  const w = canvas.width; const h = canvas.height;
  ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(148,163,184,.14)'; ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) { const y = h * i / 5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  const speeds = state.samples; const maxSpeed = Math.max(...speeds, 1);
  drawLine(ctx, speeds, maxSpeed, '#38bdf8', value => h - (value / maxSpeed) * (h - 28) - 14);
  const lats = state.latency.map(v => Number.isFinite(v) ? v : 0); const maxLat = Math.max(...lats, 100);
  drawLine(ctx, lats, maxLat, '#f59e0b', value => h - (value / maxLat) * (h - 28) - 14);
  ctx.fillStyle = '#94a3b8'; ctx.font = '22px system-ui'; ctx.fillText(`${t('peak')} ${formatMbps(maxSpeed)}`, 24, 36);
}
function drawLine(ctx, values, max, color, yOf) { if (values.length < 2) return; const w = ctx.canvas.width; ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.beginPath(); values.forEach((value, i) => { const x = values.length === 1 ? 0 : i * w / (values.length - 1); const y = yOf(value || 0); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }); ctx.stroke(); }

function startTest() {
  const url = selectedUrl();
  if (!url) { $('status').textContent = t('needUrl'); return; }
  resetData(); setRunning(true);
  const threads = Math.max(1, Math.min(Number($('threads').value) || 1, 64));
  const limit = Number($('trafficLimit').value) || 0;
  state.timer = setInterval(tick, 1000);
  for (let i = 0; i < threads; i++) worker(i + 1, url, limit);
  latencyLoop();
}
function stopTest(reason = t('stopped')) { if (!state.running) return; state.running = false; state.controllers.forEach(controller => controller.abort()); state.controllers = []; clearInterval(state.timer); tick(); setRunning(false); $('status').textContent = reason; }

async function loadIp() {
  try {
    const data = await api(`/api/ip?lang=${lang === 'zh' ? 'zh-CN' : 'en'}`);
    const parts = [data.ip, data.country, data.region, data.city, data.isp].filter(Boolean);
    $('ipInfo').textContent = parts.length ? parts.join(' · ') : t('unavailableIp');
    $('visitorIp').textContent = data.ip || t('unknown');
    $('visitorMeta').textContent = [data.country, data.region, data.city, data.isp, data.asn].filter(Boolean).join(' · ') || data.note || t('noMeta');
  } catch {
    $('ipInfo').textContent = t('ipFailed');
    $('visitorIp').textContent = t('ipFailed');
    $('visitorMeta').textContent = t('retry');
  }
}

$('presetUrl').addEventListener('change', () => { $('customWrap').style.display = $('presetUrl').value === 'custom' ? 'grid' : 'none'; });
$('startBtn').addEventListener('click', startTest);
$('stopBtn').addEventListener('click', () => stopTest());
$('resetBtn').addEventListener('click', resetData);
$('refreshSiteLatency').addEventListener('click', loadSiteLatency);
$('langZh').addEventListener('click', () => applyLanguage('zh'));
$('langEn').addEventListener('click', () => applyLanguage('en'));
$('customWrap').style.display = 'none';
applyLanguage(lang, { skipIp: true });
loadIp();
startSiteLatencyAutoRefresh();
resetData();
