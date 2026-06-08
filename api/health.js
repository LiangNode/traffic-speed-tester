import { allowMethods, json } from './_utils.js';

export default function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'HEAD'])) return;
  json(res, { ok: true, service: 'traffic-speed-tester', platform: 'vercel', time: new Date().toISOString() });
}
