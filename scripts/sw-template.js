/* Workbox InjectManifest template.
   This file will be processed by workbox-build injectManifest which will
   fill in the precache manifest placeholder and produce a final sw-generated.js in public/.
*/

/* global workbox */

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 50 })],
  })
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images-cache',
    plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  })
);

workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request && event.request.mode === 'navigate') {
    return caches.match('/offline.html');
  }
  return Response.error();
});

