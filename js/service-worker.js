const CACHE_NAME = "addy-app-v1.3";

const URLS_TO_CACHE = [
  "./",
  "workstation.html",
  "coloring_pages.html",

  "css/theme.css",
  "css/coloring.css",

  "js/storage.js",
  "js/router.js",
  "js/ui.js",
  "js/analytics.js",
  "js/rewards.js",
  "js/coloring.js",
  "js/boot.js",

  "pages/boy1.png",
  "pages/dino1.png",
  "pages/icecreamtruck.png",
  "pages/octopus.png",
  "pages/truck1.png",
  "pages/turtle.png",

  "icons/icon-192.png",
  "icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});