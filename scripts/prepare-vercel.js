import { cp, mkdir } from 'node:fs/promises';

await mkdir('public', { recursive: true });
await cp('app/public', 'public', { recursive: true });
console.log('Prepared static assets in ./public');
