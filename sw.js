// Service worker: makes the game installable and playable offline, and shows the
// daily-puzzle reminder on phones (see _design_screens/notify.js).
// CACHE and CORE are rewritten by assemble.py on every build: the name changes with each build so
// old files are dropped, and CORE lists everything the game needs offline, block art included.
var CACHE = 'sbp-11101510';
var CORE = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./fonts/baloo2-latin.woff2", "./fonts/baloo2-latin-ext.woff2", "./blocks/balon/kirmizi_h2.webp", "./blocks/balon/kirmizi_h3.webp", "./blocks/balon/kirmizi_sq.webp", "./blocks/balon/kirmizi_v2.webp", "./blocks/balon/kirmizi_v3.webp", "./blocks/balon/mavi_h2.webp", "./blocks/balon/mavi_h3.webp", "./blocks/balon/mavi_sq.webp", "./blocks/balon/mavi_v2.webp", "./blocks/balon/mavi_v3.webp", "./blocks/balon/mor_h2.webp", "./blocks/balon/mor_h3.webp", "./blocks/balon/mor_sq.webp", "./blocks/balon/mor_v2.webp", "./blocks/balon/mor_v3.webp", "./blocks/balon/pembe_h2.webp", "./blocks/balon/pembe_h3.webp", "./blocks/balon/pembe_sq.webp", "./blocks/balon/pembe_v2.webp", "./blocks/balon/pembe_v3.webp", "./blocks/balon/sari_h2.webp", "./blocks/balon/sari_h3.webp", "./blocks/balon/sari_sq.webp", "./blocks/balon/sari_v2.webp", "./blocks/balon/sari_v3.webp", "./blocks/balon/turkuaz_h2.webp", "./blocks/balon/turkuaz_h3.webp", "./blocks/balon/turkuaz_sq.webp", "./blocks/balon/turkuaz_v2.webp", "./blocks/balon/turkuaz_v3.webp", "./blocks/balon/turuncu_h2.webp", "./blocks/balon/turuncu_h3.webp", "./blocks/balon/turuncu_sq.webp", "./blocks/balon/turuncu_v2.webp", "./blocks/balon/turuncu_v3.webp", "./blocks/sekerleme/gunbatimi_h2.webp", "./blocks/sekerleme/gunbatimi_h3.webp", "./blocks/sekerleme/gunbatimi_sq.webp", "./blocks/sekerleme/gunbatimi_v2.webp", "./blocks/sekerleme/gunbatimi_v3.webp", "./blocks/sekerleme/kirmizi_h2.webp", "./blocks/sekerleme/kirmizi_h3.webp", "./blocks/sekerleme/kirmizi_sq.webp", "./blocks/sekerleme/kirmizi_v2.webp", "./blocks/sekerleme/kirmizi_v3.webp", "./blocks/sekerleme/mavi_h2.webp", "./blocks/sekerleme/mavi_h3.webp", "./blocks/sekerleme/mavi_sq.webp", "./blocks/sekerleme/mavi_v2.webp", "./blocks/sekerleme/mavi_v3.webp", "./blocks/sekerleme/mor_h2.webp", "./blocks/sekerleme/mor_h3.webp", "./blocks/sekerleme/mor_sq.webp", "./blocks/sekerleme/mor_v2.webp", "./blocks/sekerleme/mor_v3.webp", "./blocks/sekerleme/pembe_h2.webp", "./blocks/sekerleme/pembe_h3.webp", "./blocks/sekerleme/pembe_sq.webp", "./blocks/sekerleme/pembe_v2.webp", "./blocks/sekerleme/pembe_v3.webp", "./blocks/sekerleme/sari_h2.webp", "./blocks/sekerleme/sari_h3.webp", "./blocks/sekerleme/sari_sq.webp", "./blocks/sekerleme/sari_v2.webp", "./blocks/sekerleme/sari_v3.webp", "./blocks/sekerleme/turkuaz_h2.webp", "./blocks/sekerleme/turkuaz_h3.webp", "./blocks/sekerleme/turkuaz_sq.webp", "./blocks/sekerleme/turkuaz_v2.webp", "./blocks/sekerleme/turkuaz_v3.webp", "./blocks/sekerleme/turuncu_h2.webp", "./blocks/sekerleme/turuncu_h3.webp", "./blocks/sekerleme/turuncu_sq.webp", "./blocks/sekerleme/turuncu_v2.webp", "./blocks/sekerleme/turuncu_v3.webp"];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// The page itself: network first so new versions arrive right away, cache when offline.
// Everything else (icons, fonts): cache first, filled as it is used.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.pathname.indexOf('/__') !== -1) return; // dev server endpoints
  if (req.mode === 'navigate' || url.pathname.endsWith('.html')) {
    // no-store: skip the browser's HTTP cache too (GitHub Pages allows 10 minutes), so a new
    // build shows up the next time the app is opened
    e.respondWith(fetch(req, { cache: 'no-store' }).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
      return res;
    }).catch(function () { return caches.match('./index.html'); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (hit) {
    return hit || fetch(req).then(function (res) {
      if (res.ok || res.type === 'opaque') { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    });
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(function (wins) {
    if (wins.length) return wins[0].focus();
    return self.clients.openWindow('./index.html');
  }));
});
