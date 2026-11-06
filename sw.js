/* Service worker: офлайн-режим для приложения «Меню и покупки» */
const CACHE = 'menu-planner-v5';
const APPLES = Array.from({length:12}, (_, i) => `./apples/a${i + 1}.svg`);   // картинки-яблоки вместо эмодзи
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './fonts/montserrat-var.woff', ...APPLES];

// Установка: кладём основные файлы в кэш
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

// Активация: удаляем старые версии кэша
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Запросы: сначала сеть (чтобы получать обновления), при отсутствии сети — кэш.
// Шрифты Google и прочие файлы кэшируются «на лету».
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
