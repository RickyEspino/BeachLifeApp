/* Workbox-based service worker using CDN build.
   This file imports Workbox from the CDN and sets up precaching for core assets
   plus a navigation fallback to /offline.html. It also adds a runtime cache for images.
*/

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  // Precaching list - keep in sync with files you want cached at install time
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: null },
    { url: '/index.html', revision: null },
    { url: '/manifest.json', revision: null },
    { url: '/offline.html', revision: null },
    { url: '/file.svg', revision: null },
    { url: '/icons/icon-192.png', revision: null },
    { url: '/icons/icon-512.png', revision: null },
    { url: '/icons/icon-512-maskable.png', revision: null },
  ]);

  // Navigation route - network first, fallback to offline page
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: 'pages-cache',
      plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 50 })],
    })
  );

  // Runtime cache for images
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache',
      plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })],
    })
  );

  // Fallback to offline.html when navigation fails
  workbox.routing.setCatchHandler(async ({ event }) => {
    if (event.request && event.request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    return Response.error();
  });
} else {
  /* Workbox failed to load; simple fallback caching strategy */
  self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request).catch(() => caches.match('/offline.html')));
  });
}
