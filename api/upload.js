import { allowMethods, json } from './_utils.js';

export const config = {
  api: { bodyParser: false }
};

export default function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  let bytes = 0;
  req.on('data', chunk => { bytes += chunk.length; });
  req.on('end', () => json(res, { ok: true, bytes }));
  req.on('error', error => json(res, { error: 'upload_failed', message: error?.message || String(error) }, 500));
}
