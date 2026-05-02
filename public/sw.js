/* Minimal inspector PWA shell — cache shell; API/data stays network-first until backend caching is defined. */
const CACHE = 'carschek-shell-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(['/favicon.ico']).catch(() => {})
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Stale-while-revalidate for same-origin static assets
  if (url.pathname.match(/\.(js|css|woff2?|png|jpg|svg|ico)$/)) {
    event.respondWith(
      caches.match(request).then(cached => {
        const fetchPromise = fetch(request)
          .then(res => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then(c => c.put(request, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});
