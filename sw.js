// Network-first service worker: always fresh when online, works offline from cache.
const CACHE = 'killteam-v40';
const ASSETS = [
  'js/tombworld-access.js', 'js/tombworld-maps.js', 'js/tombworld.js', 'js/data/tombworld.js',
  'js/wrecka.js', 'js/data/wrecka.js',
  'js/nightlords.js', 'js/data/nightlords.js', 'js/ratlings.js', 'js/data/ratlings.js', 'js/sanctifiers.js', 'js/data/sanctifiers.js', 'js/pathfinders.js', 'js/data/pathfinders.js', 'js/angels.js', 'js/data/angels.js', 'js/plague.js', 'js/data/plague.js', 'js/kommandos.js', 'js/data/kommandos.js', 'js/kinband.js', 'js/data/kinband.js', 'js/deathkorps.js', 'js/data/deathkorps.js', 'js/data/canoptek.js', 'js/raveners.js', 'js/data/raveners.js', 'js/spectres.js', 'js/data/spectres.js', 'js/aquilons.js', 'js/data/aquilons.js', 'js/voiddancers.js', 'js/data/voiddancers.js', 'js/vespids.js', 'js/data/vespids.js', 'js/stealthsuits.js', 'js/data/stealthsuits.js', 'js/wolfscouts.js', 'js/data/wolfscouts.js',
  'js/scouts.js', 'js/data/scouts.js',
  'js/models3d.js', 'js/models3d-teams.js', 'js/terrain3d.js', 'js/viewer3d.js', 'js/vendor/three.module.min.js',
  'js/murderwing.js', 'js/data/murderwing.js',
  'js/mandrakes.js', 'js/data/mandrakes.js',
  './', 'index.html', 'manifest.webmanifest', 'icons/icon.svg', 'css/style.css',
  'js/deathwatch.js', 'js/data/deathwatch.js', 'js/corsair.js', 'js/archon.js', 'js/data/eldar.js', 'js/main.js', 'js/game.js', 'js/board.js', 'js/path.js', 'js/ai.js', 'js/geometry.js', 'js/sight.js', 'js/i18n.js', 'js/help.js', 'js/replay.js', 'js/missions.js', 'js/data/teams.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html'))),
  );
});
