import { json } from './_utils.js';

export default function handler(req, res) {
  json(res, { ok: true, service: 'traffic-speed-tester', platform: 'vercel', time: new Date().toISOString() });
}
