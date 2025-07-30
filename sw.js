// sw.js - Letakkan di folder utama "Quiz Game"
const CACHE_NAME = "aether-quiz-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./quiz.html",
  "./result.html",
  "./saran.html",
  "./css/style.css",
  "./css/quiz-style.css",
  "./css/result.css",
  "./css/saran.css",
  "./js/script.js",
  "./js/questions.js",
  "./js/quiz.js",
  "./js/saran.js",
  "./manifest.json",
  // Tambahkan file gambar/icon jika ada
  // './images/logo.png',
  // './images/icon-192.png',
  // './images/icon-512.png'
];

// Event install - cache semua file yang diperlukan
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching files");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log("Service Worker: All files cached successfully");
        return self.skipWaiting(); // Aktifkan service worker baru langsung
      })
      .catch((error) => {
        console.error("Service Worker: Caching failed", error);
      })
  );
});

// Event activate - bersihkan cache lama jika ada
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Activated");
        return self.clients.claim(); // Kontrol semua client pages
      })
  );
});

// Event fetch - intercept semua network requests
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Jika ada di cache, return cached version
      if (cachedResponse) {
        console.log("Service Worker: Serving from cache", event.request.url);
        return cachedResponse;
      }

      // Jika tidak ada di cache, coba fetch dari network
      console.log("Service Worker: Fetching from network", event.request.url);
      return fetch(event.request)
        .then((response) => {
          // Cek apakah response valid
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone response karena response stream hanya bisa digunakan sekali
          const responseToCache = response.clone();

          // Cache response untuk request selanjutnya
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch((error) => {
          console.error("Service Worker: Fetch failed", error);

          // Jika offline dan request adalah untuk halaman HTML,
          // return halaman offline atau halaman utama
          if (event.request.destination === "document") {
            return caches.match("./index.html");
          }

          throw error;
        });
    })
  );
});

// Event message - handle pesan dari main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
