const CACHE_NAME = "sans-capote-cache-v1";
const OFFLINE_URLS = [
  "/",
  "/guide",
  "/crisis",
  "/navigator",
  "/resources",
  "/settings",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).catch(() => {
        // If network fails and we have a cached version of the root, use it for navigation
        if (request.mode === "navigate") {
          return caches.match("/");
        }
        throw new Error("Network error and no cache available");
      });
    })
  );
});
