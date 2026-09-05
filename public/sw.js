const VERSION = 'csv-keyed-diff-v4';
const SHELL = [
  '/', '/index.html', '/demo', '/privacy', '/terms', '/404.html', '/404.css', '/offline.html', '/offline.css', '/manifest.webmanifest',
  '/assets/reconciliation-lens.webp', '/assets/reconciliation-lens-mobile.webp',
  '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(SHELL);
    const markup = await (await fetch('/index.html')).text();
    const builtAssets = [...markup.matchAll(/(?:src|href)="(\/assets\/[^"?]+)"/g)].map((match) => match[1]);
    await cache.addAll([...new Set(builtAssets)]);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))),
    self.clients.claim(),
  ]));
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone(); caches.open(VERSION).then((cache) => cache.put(event.request, copy)); return response;
    }).catch(async () => {
      const knownPage = ['/', '/index.html', '/demo', '/demo/', '/privacy', '/privacy/', '/terms', '/terms/'].includes(url.pathname);
      if (!knownPage) return (await caches.match('/404.html')) || caches.match('/offline.html');
      return (await caches.match(event.request)) || (await caches.match(url.pathname.replace(/\/$/, '') || '/')) || (await caches.match('/index.html')) || caches.match('/offline.html');
    }));
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(url.pathname);
    if (cached) return cached;
    const response = await fetch(event.request);
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(VERSION).then((cache) => cache.put(url.pathname, copy)));
    }
    return response;
  })());
});
