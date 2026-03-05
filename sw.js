const CACHE_VERSION = 'fitfuel-v20';
const ASSETS = ['./', './index.html', './manifest.json', './icon.jpg'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first: serve instantly, update in background
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE_VERSION).then(cache =>
      cache.match(e.request).then(cached => {
        const fresh = fetch(e.request).then(r => {
          if (r && r.status === 200 && r.type === 'basic') cache.put(e.request, r.clone());
          return r;
        }).catch(() => null);
        return cached || fresh;
      })
    )
  );
});
