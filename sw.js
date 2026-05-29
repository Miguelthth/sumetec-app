const CACHE = 'sumetec-rem-v3';
const STATIC = [
  './remision.html',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js'
];

// Instalar: cachear assets estáticos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  );
});

// Activar: limpiar cachés viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Apps Script y Google Fonts: solo red, nunca caché
  if (url.includes('script.google.com') || url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    return;
  }

  // HTML principal: red primero, caché como fallback
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match('./remision.html'))
    );
    return;
  }

  // Assets estáticos (jsPDF, etc.): caché primero, red como fallback
  e.respondWith(
    caches.match(e.request).then(r => {
      if (r) return r;
      return fetch(e.request).then(r2 => {
        caches.open(CACHE).then(c => c.put(e.request, r2.clone()));
        return r2;
      });
    })
  );
});
