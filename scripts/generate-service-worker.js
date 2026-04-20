const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version || '1.0.0';

const CACHE_NAME = `kyt-coaching-v${version}`;

const serviceWorkerContent = `// Generado en build - CACHE_NAME incluye la versión de package.json (${version})
const CACHE_NAME = '${CACHE_NAME}';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
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
`;

const outputPath = path.join(__dirname, '..', 'public', 'service-worker.js');
fs.writeFileSync(outputPath, serviceWorkerContent, 'utf8');
console.log(`[generate-service-worker] service-worker.js generado con CACHE_NAME="${CACHE_NAME}"`);
