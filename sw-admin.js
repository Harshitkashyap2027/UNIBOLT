const CACHE_NAME = 'unibolt-admin-v1';
const ASSETS = [
  '/admin',      // <--- FIXED: Added .html
  '/dashboard.css',   // Assuming you share the same CSS
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});

// PUSH NOTIFICATIONS
self.addEventListener('push', function(event) {
  if (event.data) {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: 'admin.png', // Ensure this image exists
        badge: 'admin.png',
        vibrate: [100, 50, 100],
        data: { url: '/admin' }
      };
      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});