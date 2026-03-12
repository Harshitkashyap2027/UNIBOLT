const CACHE_NAME = 'unibolt-ai-v1';
const ASSETS = [
  '/AI',
  '/dashboard.css',
  '/UniBolt.png',
  '/js/AI.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Fetch Event (Offline Capability)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
// 4. PUSH NOTIFICATIONS (Background Listener)
self.addEventListener('push', event => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
        body: data.message,
        icon: 'https://cdn-icons-png.flaticon.com/512/4080/4080031.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/4080/4080031.png'
    });
});

// 3. FETCH: Stale-While-Revalidate Strategy (The "Fastest" method)
self.addEventListener("fetch", (e) => {
    // Ignore non-GET requests (like Firebase writes)
    if (e.request.method !== "GET" || e.request.url.startsWith("chrome-extension")) return;

    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            // Serve cached file immediately if found
            const fetchPromise = fetch(e.request).then((networkResponse) => {
                // Update cache in background
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, networkResponse.clone());
                    return networkResponse;
                });
            }).catch(() => {
                // If offline and page not cached, show offline page
                if (e.request.mode === 'navigate') {
                    return caches.match('/offline');
                }
            });

            return cachedResponse || fetchPromise;
        })
    );
});