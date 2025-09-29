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

workbox.precaching.precacheAndRoute([{"revision":"d09f95206c3fa0bb9bd9fefabfd0ea71","url":"file.svg"},{"revision":"2aaafa6a49b6563925fe440891e32717","url":"globe.svg"},{"revision":"e91795a8a97900c9905c35a9c2ef17c0","url":"icons/apple-touch-icon.png"},{"revision":"114700cf609e93f9687dc9f69a4eb40e","url":"icons/icon-128.png"},{"revision":"27edb27eb3666b2f0f884c08e80bd921","url":"icons/icon-144.png"},{"revision":"0cc88ae19cfcd08703d13ad2cee8d6a6","url":"icons/icon-152.png"},{"revision":"e11c479d8bd9dd7f19f70f86f0168ce5","url":"icons/icon-192.png"},{"revision":"0d14e177a3637c2f0544b24d06e02e88","url":"icons/icon-384.png"},{"revision":"294ccabd1431df7436e0e795646126f0","url":"icons/icon-512.png"},{"revision":"6a24ee3a645f1d2d01a98b46d89cdcf5","url":"icons/icon-72.png"},{"revision":"ad75b4bdc11d5b2b004ce3566b52379d","url":"icons/icon-96.png"},{"revision":"2727c2e327624927718b3c23a92cdd01","url":"icons/maskable-192.png"},{"revision":"21e74b1817c2b55b961d1b350ce426d9","url":"manifest.json"},{"revision":"8e061864f388b47f33a1c3780831193e","url":"next.svg"},{"revision":"8d69d5f7199374980c815a618c67b8d2","url":"offline.html"},{"revision":"b0a47b77eaf768c0a5ca0718b328a710","url":"sw.js"},{"revision":"c0af2f507b369b085b35ef4bbe3bcf1e","url":"vercel.svg"},{"revision":"a2760511c65806022ad20adf74370ff3","url":"window.svg"}] || []);

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

