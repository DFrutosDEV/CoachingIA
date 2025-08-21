const CACHE_NAME = 'coaching-ia-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/next.svg', //! MODIFICAR Icono de la aplicación 
  // '/next.svg', //! MODIFICAR Icono de la aplicación
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // ✅ Solo cachear requests HTTP/HTTPS (no chrome-extension, etc.)
            if (event.request.url.startsWith('http')) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                })
                .catch((error) => {
                  console.warn('Service Worker: Error cacheando request:', error);
                });
            }
            
            return response;
          });
      })
  );
});