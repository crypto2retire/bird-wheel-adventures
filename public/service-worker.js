/** @file service-worker.js - Simple offline caching */

const CACHE_NAME = 'bird-wheel-v2';

// Only cache non-versioned assets (manifest, icons, fallback)
// Versioned assets (hashed JS/CSS) are handled by browser HTTP caching
const ASSETS = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // For navigation requests (index.html), always fetch fresh
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // For everything else, try cache first, then network
  e.respondWith(
    caches.match(e.request).then(response => {
      if (response) return response;
      return fetch(e.request).catch(() => {});
    })
  );
});
