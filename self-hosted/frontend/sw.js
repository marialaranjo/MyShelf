// Service worker: cache da "app shell" para funcionar sem rede, mais o
// mínimo para PWA instalável. Estratégia: rede primeiro (para ires sempre à
// versão mais recente quando há rede, sem usar o cache HTTP do browser), cache
// como fallback quando offline.
// Nunca intercepta /api/* — PocketBase é sempre pedido à rede a sério; a
// app já sabe lidar com essas falhas (ver DB em app.js).
const CACHE_NAME = 'biblio-shell-v3';
const SHELL_FILES = ['/', 'index.html', 'app.js', 'manifest.json', 'icon.svg'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL_FILES)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;      // fontes/externos: direto à rede
  if (url.pathname.startsWith('/api/')) return;     // PocketBase: sempre rede, nunca cache

  e.respondWith(
    // cache:'no-cache' → pergunta sempre ao servidor se há versão nova (ETag),
    // mesmo que o Cloudflare tenha dito ao browser para guardar o ficheiro 4 h.
    fetch(req, { cache: 'no-cache' })
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then(cached => cached || caches.match('index.html')))
  );
});
