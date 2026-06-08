import { json } from './_utils.js';

const links = [
  { name: 'CacheFly 10MB', url: 'https://cachefly.cachefly.net/10mb.test', category: '直链下载', desc: '国际 CDN 10MB 测试文件，适合浏览器下载测速参考', tags: ['10MB', 'CDN', '下载'] },
  { name: 'Speedtest by Ookla', url: 'https://www.speedtest.net/', category: '网页测速', desc: '全球主流测速入口，可手动选择测速节点', tags: ['网页测速', '选节点', '下载上传'] },
  { name: 'Cloudflare Speed Test', url: 'https://speed.cloudflare.com/', category: '网页测速', desc: '展示延迟、抖动、下载、上传等细项指标', tags: ['Cloudflare', '指标详细', '抖动'] },
  { name: 'SpeedTest.cn', url: 'https://www.speedtest.cn/', category: '国内测速', desc: '中文测速入口，适合国内宽带、5G、IPv6 诊断', tags: ['国内', '中文', 'IPv6'] },
  { name: 'ITDOG HTTP 测速', url: 'https://www.itdog.cn/http/', category: '拨测', desc: '多地区、多运营商 HTTP 拨测，适合看全国访问情况', tags: ['三网', '多地区', '拨测'] }
];

export default function handler(req, res) {
  json(res, { links });
}
