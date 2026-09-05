import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
const config = JSON.parse(await readFile(join(root, 'staticwebapp.config.json'), 'utf8'));
const port = Number(process.env.PORT ?? 4173);
let testWorkerVersion = '';
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

function safePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = normalize(decoded).replace(/^([/\\])+/, '');
  return relative.startsWith('..') ? null : join(root, relative);
}

async function resolveFile(pathname) {
  const target = safePath(pathname);
  if (!target) return null;
  for (const candidate of [target, join(target, 'index.html')]) {
    try { if ((await stat(candidate)).isFile()) return candidate; } catch { /* Try the next exact candidate. */ }
  }
  return null;
}

createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', `http://${request.headers.host}`).pathname;
  if (pathname === '/__test/sw-version' && request.method === 'POST') {
    testWorkerVersion = new URL(request.url ?? '/', `http://${request.headers.host}`).searchParams.get('value') ?? '';
    response.statusCode = 204;
    response.end();
    return;
  }
  let file = await resolveFile(pathname);
  let status = 200;
  if (!file) {
    status = 404;
    file = join(root, config.responseOverrides['404'].rewrite.replace(/^\//, ''));
  }
  for (const [name, value] of Object.entries(config.globalHeaders)) response.setHeader(name, value);
  if (/^\/assets\/.*\.(?:js|css)$/.test(pathname)) response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  if (pathname === '/sw.js') response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.statusCode = status;
  response.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
  if (request.method === 'HEAD') { response.end(); return; }
  if (pathname === '/sw.js' && testWorkerVersion) {
    const worker = await readFile(file, 'utf8');
    response.end(worker.replace('csv-keyed-diff-v4', `csv-keyed-diff-test-${testWorkerVersion}`));
    return;
  }
  createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1');
