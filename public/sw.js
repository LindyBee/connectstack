/* ConnectStack: keeps the app opening when the connection drops. Never stores account data. */
const CACHE = 'connectstack-2';
const SHELL = ['/', '/shuttle-paths.js', '/voice.js', '/icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(()=>{})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api')) return;
  const key = r.mode === 'navigate' ? '/' : (SHELL.includes(u.pathname) ? u.pathname : null);
  if (!key) return;
  /* Network first, so updates show right away; the saved copy is only used when offline. */
  e.respondWith(fetch(r).then(res => { const copy = res.clone(); if (res.ok) caches.open(CACHE).then(c => c.put(key, copy)); return res; }).catch(() => caches.match(key)));
});
