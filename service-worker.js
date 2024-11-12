const CACHE_NAME = 'portfolio-pwa-v1';
const urlsToCache = [
  '/',
  '/index.html',           // Halaman utama
  '/style.css',             // File CSS
  '/app.js',                // JavaScript utama
  '/images/profile.jpg',    // Gambar profil (sesuaikan dengan nama file dan direktori)
  '/offline.html',          // Halaman offline untuk fallback
];

// Menginstal Service Worker dan melakukan cache pada aset yang diperlukan
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching assets');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => console.log('Cache failed:', error))
  );
  self.skipWaiting();
});

// Mengaktifkan Service Worker dan menghapus cache lama jika ada perubahan
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Menangani permintaan jaringan dan memberikan respons dari cache jika tersedia
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Kembalikan dari cache jika tersedia
        if (response) {
          return response;
        }
        // Jika tidak ada di cache, ambil dari jaringan dan simpan ke cache
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        });
      })
      .catch(() => caches.match('/offline.html')) // Fallback ke halaman offline saat offline
  );
});

// Menangani Push Event dan Menampilkan Notifikasi
self.addEventListener('push', (event) => {
  let options = {
    body: event.data ? event.data.text() : 'Default Push Message',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
  };

  event.waitUntil(
    self.registration.showNotification('New Notification', options)
  );
});

// Menangani Klik Notifikasi
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Menutup notifikasi setelah diklik

  // Menangani klik pada notifikasi, bisa diarahkan ke halaman tertentu
  event.waitUntil(
    clients.openWindow('/') // Misalnya membuka halaman utama setelah klik
  );
});
