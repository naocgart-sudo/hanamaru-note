// はなまるノート service worker：アプリ本体はキャッシュ、問題データは最新を優先
const V = 'hm-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin !== location.origin) return;
  // 問題データとページ本体はネット優先（毎日の更新をすぐ反映）、オフライン時はキャッシュ
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); const key = u.origin + u.pathname; caches.open(V).then(ca => ca.put(key, c)); return r; })
    .catch(() => caches.match(u.origin + u.pathname).then(r => r || caches.match('index.html'))));
});
