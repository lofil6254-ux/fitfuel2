// sw.js — FitFuel Service Worker
// ⚠️ IMPORTANT: Bump CACHE_VERSION every time you push an update to GitHub.
// Change 'fitfuel-v1' → 'fitfuel-v9' → 'fitfuel-v3' etc.
// This forces your phone to delete the old cache and fetch fresh files.
const CACHE_VERSION = 'fitfuel-v9';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.jpg'
];

// INSTALL — cache all core assets
self.addEventListener('install', event => {
  self.skipWaiting(); // activate immediately, don't wait for old tabs to close
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(ASSETS))
  );
});

// ACTIVATE — delete any old version caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim()) // take control of all open tabs immediately
  );
});

// FETCH — network-first strategy
// Always tries the network first so updates from GitHub are picked up instantly.
// Falls back to cache only when offline.
self.addEventListener('fetch', event => {
  // Only handle GET requests for same-origin resources
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache a fresh copy of every successful same-origin response
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request)) // offline fallback to cache
  );
});
