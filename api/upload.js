import { json } from './_utils.js';

export const config = {
  api: { bodyParser: false }
};

export default function handler(req, res) {
  if (req.method !== 'POST') return json(res, { error: 'method_not_allowed' }, 405);
  let bytes = 0;
  req.on('data', d => { bytes += d.length; });
  req.on('end', () => json(res, { ok: true, bytes }));
}
