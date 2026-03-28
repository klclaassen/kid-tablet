const CACHE_NAME = "addy-app-v2.7";

const URLS_TO_CACHE = [
  "./",
  "index.html",
  "avatar.html",
  "coloring_pages.html",
  "analytics.html",
  "manifest.json",

  "css/theme.css",
  "css/coloring.css",
  "css/avatar.css",

  "js/storage.js",
  "js/router.js",
  "js/ui.js",
  "js/analytics.js",
  "js/rewards.js",
  "js/coloring.js",
  "js/avatar.js",
  "js/workstation.js",
  "js/settings.js",
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
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});