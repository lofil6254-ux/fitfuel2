// sw.js — FitFuel Service Worker
const CACHE_VERSION = 'fitfuel-v15';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.jpg'
];

// INSTALL — cache all assets immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(ASSETS))
  );
});

// ACTIVATE — delete old caches, take control immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// FETCH — cache-first, update in background
// Serves from cache instantly (no blank screen), fetches fresh copy silently for next time
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(cache => {
      return cache.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => null);

        // Serve cache instantly, fall back to network if not cached yet
        return cached || fetchPromise;
      });
    })
  );
});
