// Network-first service worker: always fresh when online, works offline from cache.
const CACHE = 'killteam-v4';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'icons/icon.svg', 'css/style.css',
  'js/corsair.js', 'js/archon.js', 'js/data/eldar.js', 'js/main.js', 'js/game.js', 'js/board.js', 'js/path.js', 'js/ai.js', 'js/geometry.js', 'js/sight.js', 'js/i18n.js', 'js/help.js', 'js/replay.js', 'js/missions.js', 'js/data/teams.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html'))),
  );
});
