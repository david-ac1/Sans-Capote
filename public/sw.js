const CACHE_NAME = "sans-capote-cache-v2"; // Bumped version to clear old cache
const OFFLINE_URLS = [
  "/",
  "/guide",
  "/crisis",
  "/navigator",
  "/resources",
  "/settings",
];

self.addEventListener("install", (event) => {
  // Skip waiting to activate new SW immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

self.addEventListener("activate", (event) => {
  // Claim clients immediately
  event.waitUntil(
    Promise.all([
      // Clear old caches
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  // NEVER cache Next.js build assets - always fetch fresh
  if (url.pathname.startsWith('/_next/static/') || 
      url.pathname.startsWith('/_next/data/') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js')) {
    event.respondWith(fetch(request));
    return;
  }

  // Network-first strategy for everything else
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache only when offline
        return caches.match(request).then((cached) => {
          if (cached) {
            return cached;
          }
          // If navigation and offline, return root
          if (request.mode === "navigate") {
            return caches.match("/");
        }
        throw new Error("Network error and no cache available");
      });
    })
  );
});
