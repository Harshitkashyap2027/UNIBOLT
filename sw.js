const CACHE_NAME = "unibolt-pro-v2";
const STATIC_ASSETS = [
    "/signup",
    "/dashboard",
    "/offline", // You need to create this simple page
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
];

// 1. INSTALL: Cache Core Assets immediately
self.addEventListener("install", (e) => {
    console.log("[PWA] Installing Service Worker...");
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting(); // Force activation
});

// 2. ACTIVATE: Clean up old caches
self.addEventListener("activate", (e) => {
    console.log("[PWA] Activated");
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
    return self.clients.claim();
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

// 4. PUSH NOTIFICATIONS (Background Listener)
self.addEventListener('push', event => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
        body: data.message,
        icon: 'https://cdn-icons-png.flaticon.com/512/4080/4080031.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/4080/4080031.png'
    });
});