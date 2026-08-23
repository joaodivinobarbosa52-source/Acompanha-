const CACHE = 'acompanhar-trator-v1';
const SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e)=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(SHELL)));
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys=> Promise.all(keys.filter(k=> k!==CACHE).map(k=> caches.delete(k))))
  );
  self.clients.claim();
});

// estratégia: sempre tenta a rede primeiro (dados ao vivo mudam o tempo todo);
// só cai pro cache se estiver offline — e mesmo assim, só serve o "shell" estático,
// nunca dados do Firebase (esses exigem conexão de qualquer forma)
self.addEventListener('fetch', (e)=>{
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return; // não mexe em chamadas externas (Firebase, tiles do mapa etc.)

  e.respondWith(
    fetch(e.request).catch(()=> caches.match(e.request))
  );
});
