var CACHE_NAME = 'switchhack-v3';
var PRECACHE = [
  '/',
  '/guide/',
  '/intel/',
  '/directory/',
  '/community/',
  '/about/',
  '/legal/',
  '/prep/',
  '/404/',
  '/assets/css/tailwind.min.css',
  '/assets/css/styles.css',
  '/assets/js/nav.js',
  '/assets/fonts/inter-latin.woff2',
  '/assets/fonts/jetbrains-mono-latin.woff2'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // Only cache same-origin GET requests
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Network-first for HTML, JS, CSS, and data (avoid stale UI after updates)
  if (
    url.pathname.startsWith('/data/') ||
    url.pathname.startsWith('/assets/js/') ||
    url.pathname.startsWith('/assets/css/') ||
    e.request.mode === 'navigate' ||
    e.request.destination === 'document'
  ) {
    e.respondWith(
      fetch(e.request).then(function(res) {
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
        return res;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }

  // Stale-while-revalidate for everything else
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fetchPromise = fetch(e.request).then(function(res) {
        if (res.ok) {
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
        }
        return res;
      }).catch(function() {
        return cached;
      });
      return cached || fetchPromise;
    })
  );
});
