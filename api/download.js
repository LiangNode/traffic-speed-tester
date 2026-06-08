import { parseSize } from './_utils.js';

export default async function handler(req, res) {
  // Vercel Serverless is not intended for large generated files.
  // Keep this endpoint lightweight; large traffic tests should use external CORS-readable sources.
  const size = Math.min(parseSize(req.query?.size), 4 * 1024 * 1024);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', String(size));
  res.setHeader('Cache-Control', 'no-store');
  const chunk = Buffer.alloc(64 * 1024, 7);
  let sent = 0;
  while (sent < size) {
    const n = Math.min(chunk.length, size - sent);
    if (!res.write(n === chunk.length ? chunk : chunk.subarray(0, n))) {
      await new Promise(resolve => res.once('drain', resolve));
    }
    sent += n;
  }
  res.end();
}
