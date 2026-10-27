// Progressive Web App Service Worker
// Enables 100% Offline Kiosk Operation for Edu Fair 2026 (Sloka The School)

const CACHE_NAME = 'sloka-edufair-cache-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './assets/logo.jpg',
  './js/app.js',
  './js/audio.js',
  './js/questions.js',
  './js/synonymIllustrations.js',
  './js/phenomenonAnimations.js',
  './js/camera.js',
  './js/printer.js',
  './js/leaderboard.js',
  './js/confetti.js'
];

// 1. Install Event: Pre-cache all app assets for offline use
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching static assets for offline use');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up old caches & take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Stale-While-Revalidate & Cache-First with Network fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // If request is for dynamic sync API, attempt network, fallback to offline response
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ offline: true, message: 'Offline mode active' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // For all UI assets, illustrations, animations, audio, and scripts:
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset immediately for instant offline loading
        // Also fetch in background to update cache when online
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {
          // Expected when completely offline - ignore network error
        });
        return cachedResponse;
      }

      // If not yet in cache, fetch from network and store in cache
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

